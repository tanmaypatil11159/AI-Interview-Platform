import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ServerUrl } from "../utils/constants";
import femaleVideo from "../assets/female-ai.mp4";
import maleVideo from "../assets/male-ai.mp4";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

/**
 * ============================================================================
 * AI SMART INTERVIEW COMPONENT - PRODUCTION-READY VERSION
 * ============================================================================
 * 
 * CRITICAL ARCHITECTURE FIXES:
 * 1. ✅ Single SpeechRecognition instance for entire lifecycle (never recreated)
 * 2. ✅ Event listeners registered once during initialization
 * 3. ✅ Race condition prevention between SpeechSynthesis and SpeechRecognition
 * 4. ✅ Proper video synchronization with AI speech
 * 5. ✅ Reliable transcript handling with buffer clearing
 * 6. ✅ Timer synchronization - starts only after AI finishes speaking + 400ms
 * 7. ✅ Comprehensive error handling and logging
 * 8. ✅ Browser compatibility checks
 * 9. ✅ Microphone permission handling before interview starts
 * 10. ✅ Memory leak prevention with proper cleanup
 * 11. ✅ Removed redundant voice loading useEffects
 * 12. ✅ Fixed video autoplay/loop - controlled programmatically
 * 13. ✅ Implemented toggleRecording
 * 14. ✅ Fixed timer with proper setInterval/clearInterval
 * 
 * INTERVIEW FLOW:
 * Start Interview → Request Mic → Verify APIs → Load Voices → AI Intro → 
 * First Question → Wait for AI to finish → Clear Transcript → 400ms Delay →
 * Start Timer → Listen for Answer → Submit → Get Feedback → Next Question →
 * Repeat → Last Question → Finish Interview → Cleanup
 */
function Step2({ interviewData, onFinish }) {

  // ============================================================================
  // DATA & CONFIGURATION
  // ============================================================================
  const { interviewId, questions = [], userName, mode } = interviewData || {};
  const voiceGender = "male";

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmmiting, setIsSubmmiting] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [startError, setStartError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // ============================================================================
  // REFS - PERSISTENT ACROSS RE-RENDERS & CLOSURES
  // ============================================================================
  
  // The ONE SpeechRecognition instance for entire component lifecycle
  const recognitionRef = useRef(null);
  
  // Buffer for final transcripts (doesn't trigger re-render)
  const finalTranscriptRef = useRef("");
  
  // Prevents timer submission race condition
  const timerTriggeredRef = useRef(false);
  
  // Reference to video element
  const videoRef = useRef(null);
  
  // Track component mount status to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Track AI speech state - when true, STOP recognition to prevent AI voice capture
  const isAISpeakingRef = useRef(false);
  
  // Track recognition state to prevent multiple start() calls
  const isRecognitionActiveRef = useRef(false);
  
  // Track if manual recording toggle is paused
  const isManualPauseRef = useRef(false);

  // Timer interval ref to prevent multiple interval timers
  const timerIntervalRef = useRef(null);

  // Keep-alive interval ref for speech synthesis
  const speechKeepAliveRef = useRef(null);

  // Track restart attempts to prevent infinite loops
  const restartAttemptsRef = useRef(0);
  const MAX_RESTART_ATTEMPTS = 3;

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;


  // ============================================================================
  // INITIALIZATION: SETUP SPEECH RECOGNITION ONCE FOR ENTIRE LIFECYCLE
  // ============================================================================
  // This runs only ONCE when component mounts. SpeechRecognition instance is 
  // created once and never recreated. All event listeners are attached here.
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("🎤 ❌ SpeechRecognition API is not supported in this browser");
      if (isMountedRef.current) {
        setStartError(
          "Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Brave."
        );
      }
      return;
    }

    console.log("🎤 ✅ Initializing SpeechRecognition instance (once for lifecycle)");

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening until explicitly stopped
    recognition.interimResults = true; // Get results as user is speaking
    recognition.lang = "en-IN";

    // ========================================================================
    // EVENT LISTENER: onstart - Recognition session started successfully
    // ========================================================================
    recognition.onstart = () => {
      console.log("✅ SpeechRecognition started listening");
      isRecognitionActiveRef.current = true;
      if (isMountedRef.current) {
        setIsRecording(true);
      }
    };

    // ========================================================================
    // EVENT LISTENER: onend - Recognition session ended
    // ========================================================================
    recognition.onend = () => {
      console.log("⏹️  SpeechRecognition session ended");
      isRecognitionActiveRef.current = false;
      if (isMountedRef.current) {
        setIsRecording(false);
      }
      
      // Auto-restart if interview is still active and AI isn't speaking
      // This prevents the "no-speech" timeout from permanently stopping recognition
      if (
        isMountedRef.current &&
        !isAISpeakingRef.current &&
        interviewStarted &&
        !isSubmmiting &&
        !isManualPauseRef.current &&
        restartAttemptsRef.current < MAX_RESTART_ATTEMPTS
      ) {
        console.log(`🔄 Auto-restarting recognition (attempt ${restartAttemptsRef.current + 1})`);
        restartAttemptsRef.current += 1;
        
        setTimeout(() => {
          try {
            if (recognition && !isRecognitionActiveRef.current && !isAISpeakingRef.current && !isManualPauseRef.current) {
              recognition.start();
            }
          } catch (e) {
            console.error("Failed to auto-restart recognition:", e);
          }
        }, 300);
      } else {
        restartAttemptsRef.current = 0;
      }
    };

    // ========================================================================
    // EVENT LISTENER: onerror - Handle recognition errors with details
    // ========================================================================
    recognition.onerror = (event) => {
      console.error(`❌ SpeechRecognition error: ${event.error}`);

      switch (event.error) {
        case "not-allowed":
          console.error(
            "🔒 Microphone permission denied. User must grant microphone access."
          );
          if (isMountedRef.current) {
            setStartError(
              "Microphone permission denied. Please allow microphone access to continue."
            );
          }
          break;

        case "audio-capture":
          console.error("🎤 No microphone found or audio capture unavailable.");
          if (isMountedRef.current) {
            setStartError(
              "No microphone detected. Please check your microphone connection."
            );
          }
          break;

        case "no-speech":
          console.warn(
            "⚠️  No speech detected within the timeout period. Waiting for speech..."
          );
          // This is not a fatal error, just means the user is quiet
          break;

        case "network":
          console.error("🌐 Network error during speech recognition.");
          if (isMountedRef.current) {
            setStartError(
              "Network error. Please check your internet connection."
            );
          }
          break;

        case "aborted":
          console.log("⚠️  Speech recognition was aborted.");
          break;

        default:
          console.error(`Unknown error: ${event.error}`);
          if (isMountedRef.current) {
            setStartError(`Speech Recognition error: ${event.error}`);
          }
      }

      isRecognitionActiveRef.current = false;
      if (isMountedRef.current) {
        setIsRecording(false);
      }
    };

    // ========================================================================
    // EVENT LISTENER: onresult - Process speech recognition results
    // This is called every time the user speaks. Separates interim from final
    // results and prevents capturing AI voice in the transcript.
    // ========================================================================
    recognition.onresult = (event) => {
      console.log(
        `📝 SpeechRecognition result: ${event.results.length} result(s), resultIndex: ${event.resultIndex}`
      );

      let interim = "";
      let final = finalTranscriptRef.current;

      // Process all results from resultIndex onwards
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;

        if (isFinal) {
          // Only add to final buffer on confirmed final result
          console.log(`✅ Final result: "${transcript}"`);
          final += transcript + " ";
        } else {
          // Show interim results in real-time, but don't store permanently
          console.log(`📝 Interim result: "${transcript}"`);
          interim += transcript;
        }
      }

      // Update permanent final transcript buffer (for resume after answer)
      finalTranscriptRef.current = final;

      // Update UI with combined final + interim
      if (isMountedRef.current) {
        setAnswer(final + interim);
      }
    };

    // ========================================================================
    // EVENT LISTENER: onaudiostart - Audio capture started
    // ========================================================================
    recognition.onaudiostart = () => {
      console.log("🎤 Audio capture started");
    };

    // ========================================================================
    // EVENT LISTENER: onspeechstart - Speech detected (distinguished from noise)
    // ========================================================================
    recognition.onspeechstart = () => {
      console.log("🗣️  Speech detected");
    };

    // ========================================================================
    // EVENT LISTENER: onnomatch - No recognized speech pattern
    // ========================================================================
    recognition.onnomatch = () => {
      console.warn("⚠️  No speech match detected");
    };

    // Store the configured recognition instance
    recognitionRef.current = recognition;

    console.log("🎤 ✅ SpeechRecognition setup complete with all event listeners");

    // ========================================================================
    // CLEANUP: Remove listeners and stop recognition on unmount
    // ========================================================================
    return () => {
      console.log("🧹 Cleaning up SpeechRecognition on unmount");
      isMountedRef.current = false;

      if (recognition) {
        try {
          recognition.stop();
          recognition.abort();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
    };
  }, []); // Empty dependency - runs once on mount

  // ============================================================================
  // INITIALIZATION: LOAD VOICES FOR SPEECH SYNTHESIS
  // ============================================================================
  // Voices load asynchronously in most browsers. Wait until ready before starting.
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length === 0) {
        console.log("⏳ Voices not yet loaded, waiting for onvoiceschanged event...");
        return;
      }

      console.log(`🎵 ${voices.length} voices loaded:`);
      voices.forEach((voice) => {
        console.log(
          `  - ${voice.name} (${voice.lang}${voice.default ? " - DEFAULT" : ""})`
        );
      });

      let selectedVoiceCandidate;

      // Select voice based on gender preference
      if (voiceGender === "male") {
        selectedVoiceCandidate =
          voices.find((v) => v.name.includes("David")) ||
          voices.find((v) => v.name.includes("Mark")) ||
          voices.find((v) => v.name.includes("George"));
      } else {
        selectedVoiceCandidate =
          voices.find((v) => v.name.includes("Zira")) ||
          voices.find((v) => v.name.includes("Hazel")) ||
          voices.find((v) => v.name.includes("Susan"));
      }

      // Fallback: use default voice or first available English voice, then first voice
      const finalVoice =
        selectedVoiceCandidate ||
        voices.find((v) => v.default) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];

      if (isMountedRef.current) {
        setSelectedVoice(finalVoice);
        setVoicesLoaded(true);
        setStartError("");
        console.log(`✅ Selected voice: ${finalVoice.name}`);
      }
    };

    loadVoices();

    // Handle async voice loading - some browsers fire this event
    const voicesChangedListener = () => {
      console.log("🔄 Voices changed event fired - rechecking voices");
      loadVoices();
    };

    window.speechSynthesis.onvoiceschanged = voicesChangedListener;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceGender]);

  // ============================================================================
  // HELPER: Safe recognition start (prevents InvalidStateError)
  // ============================================================================
  const startRecognition = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      console.error("❌ SpeechRecognition not initialized");
      return;
    }

    if (isAISpeakingRef.current) {
      console.log("⏸️  Cannot start recognition - AI is speaking");
      return;
    }

    if (isRecognitionActiveRef.current) {
      console.log("⚠️  Recognition already active, skipping start()");
      return;
    }

    try {
      console.log("🎤 Starting recognition...");
      isManualPauseRef.current = false;
      recognition.start();
      restartAttemptsRef.current = 0; // Reset restart counter on successful start
    } catch (error) {
      if (error.name === "InvalidStateError") {
        console.warn(
          "⚠️  InvalidStateError: Recognition already running or in progress"
        );
        // This is expected in some edge cases, just log and continue
      } else {
        console.error("❌ Error starting recognition:", error);
      }
    }
  }, []);

  // ============================================================================
  // HELPER: Safe recognition stop
  // ============================================================================
  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      console.error("❌ SpeechRecognition not initialized");
      return;
    }

    if (!isRecognitionActiveRef.current) {
      console.log("⏸️  Recognition already inactive, skipping stop()");
      return;
    }

    try {
      console.log("⏹️  Stopping recognition...");
      recognition.stop();
    } catch (error) {
      console.error("❌ Error stopping recognition:", error);
    }
  }, []);

  // ============================================================================
  // HELPER: Toggle recording manually
  // ============================================================================
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      console.log("🎤 Pausing recognition manually");
      isManualPauseRef.current = true;
      stopRecognition();
    } else {
      console.log("🎤 Resuming recognition manually");
      isManualPauseRef.current = false;
      startRecognition();
    }
  }, [isRecording, startRecognition, stopRecognition]);

  // ============================================================================
  // HELPER: Clear transcript buffer between questions
  // ============================================================================
  const clearTranscript = useCallback(() => {
    console.log("🧹 Clearing transcript buffer");
    finalTranscriptRef.current = "";
    setAnswer("");
  }, []);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  const questionTimeLimit =
    currentQuestion?.timeLimit || 60;
  const percentage = (timeLeft / questionTimeLimit) * 100;

  const timerColor =
    percentage > 60
      ? "#10b981" // green
      : percentage > 30
        ? "#f59e0b" // orange
        : "#ef4444"; // red

  const progress =
    Math.max(
      0,
      Math.min(
        circumference,
        (timeLeft / questionTimeLimit) *
        circumference
      )
    );

  const hasQuestions = Array.isArray(questions) && questions.length > 0;

  // ============================================================================
  // SPEECH SYNTHESIS - SAFE & CONTROLLED
  // ============================================================================
  const speakText = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        console.warn("⚠️ Speech synthesis not available");
        resolve();
        return;
      }

      console.log(`🔊 AI speaking: "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"`);

      // Cancel any existing speech first to prevent overlap
      window.speechSynthesis.cancel();

      // Mark AI as speaking - stops recognition to prevent capturing AI's own voice
      isAISpeakingRef.current = true;

      // Stop recognition immediately when AI starts speaking
      stopRecognition();

      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = 0.92;
      utterance.pitch =
        voiceGender === "female" ? 1.05 : 0.9;
      utterance.volume = 1;

      // ========================================================================
      // UTERANCE: onstart - AI speech has begun
      // ========================================================================
      utterance.onstart = () => {
        console.log("🔊 AI started speaking");
        if (isMountedRef.current) {
          setIsAIPlaying(true);
          setSubtitle(text);
        }

        // Reset and start avatar video with looping
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.loop = true;
          videoRef.current.play().catch((err) => {
            console.warn("⚠️ Could not play avatar video:", err);
          });
        }

        // Keep speech synthesis alive to prevent pausing
        speechKeepAliveRef.current = setInterval(() => {
          if (!isAISpeakingRef.current) {
            clearInterval(speechKeepAliveRef.current);
            return;
          }
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }, 14000); // Just under 15 seconds, which is a common timeout
      };

      // ========================================================================
      // UTERANCE: onend - AI speech has finished
      // ========================================================================
      utterance.onend = () => {
        console.log("🔊 AI finished speaking");
        isAISpeakingRef.current = false;
        // Clear the keep-alive interval
        if (speechKeepAliveRef.current) {
          clearInterval(speechKeepAliveRef.current);
          speechKeepAliveRef.current = null;
        }

        if (isMountedRef.current) {
          setIsAIPlaying(false);
          setSubtitle("");
        }

        // Pause and reset avatar video
        if (videoRef.current) {
          videoRef.current.loop = false;
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }

        resolve();
      };

      // ========================================================================
      // UTERANCE: onerror - Speech synthesis error
      // ========================================================================
      utterance.onerror = (event) => {
        console.error("❌ Speech synthesis error:", event.error);
        isAISpeakingRef.current = false;
        // Clear the keep-alive interval
        if (speechKeepAliveRef.current) {
          clearInterval(speechKeepAliveRef.current);
          speechKeepAliveRef.current = null;
        }

        if (isMountedRef.current) {
          setIsAIPlaying(false);
          setSubtitle("");
        }
        resolve();
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    });
  }, [selectedVoice, voiceGender, stopRecognition]);

  // ============================================================================
  // START INTERVIEW - FULL SEQUENCE
  // ============================================================================
  const startInterview = useCallback(async () => {
    if (interviewStarted) return;

    console.log("🚀 Starting interview...");

    // 1. Check if SpeechRecognition is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStartError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave.");
      return;
    }

    // 2. Check if SpeechSynthesis is available
    if (!window.speechSynthesis || typeof window.speechSynthesis.speak !== "function") {
      setStartError("Speech synthesis is not available in this browser.");
      return;
    }

    // 3. Check if voices are loaded
    if (!voicesLoaded || !selectedVoice) {
      setStartError("Voice setup is still loading. Please try again in a moment.");
      return;
    }

    // 4. Request microphone permission explicitly
    try {
      console.log("🎤 Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Immediately stop the stream - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      console.log("✅ Microphone permission granted");
    } catch (err) {
      console.error("🔒 Microphone permission denied:", err);
      setStartError("Microphone permission denied. Please allow microphone access to continue.");
      return;
    }

    setStartError("");
    setInterviewStarted(true);
    console.log("✅ Interview started");

    // 5. AI Introduction
    await speakText(
      `Hi ${userName}, I am ${voiceGender === "male" ? "David" : "Jennie"
      }. It's great to meet you today. I hope you're feeling confident and ready.`
    );

    if (mode === "Technical") {
      await speakText(
        "Today we'll be conducting a technical interview. I'll ask you questions related to your technical knowledge, problem-solving skills, and project experience. Take your time, explain your thought process clearly, and answer each question one at a time. Let's begin."
      );
    } else {
      await speakText(
        "Today we'll be conducting an HR interview. I'll ask you questions about your background, communication skills, teamwork, career goals, and professional experiences. Answer naturally and be yourself. Let's begin."
      );
    }

    setIsIntroPhase(false);

    // 6. First question flow
    if (questions?.length > 0) {
      setCurrentIndex(0);
      
      // AI speaks first question
      await speakText(questions[0]?.question);

      // 7. Wait 400ms after AI finishes speaking before starting anything
      console.log("⏳ Waiting 400ms after AI speech...");
      await new Promise(r => setTimeout(r, 400));

      // 8. Clear transcript before starting timer/recording
      clearTranscript();

      // 9. Reset and start timer
      setTimeLeft(questions[0]?.timeLimit || 60);
      setTimerRunning(true);
      timerTriggeredRef.current = false;

      // 10. Start recognition
      startRecognition();
    }
  }, [interviewStarted, mode, questions, selectedVoice, speakText, userName, voiceGender, startRecognition, clearTranscript, voicesLoaded]);

  // ============================================================================
  // TIMER - RELIABLE SETINTERVAL WITH REF
  // ============================================================================
  useEffect(() => {
    if (!timerRunning || !hasQuestions) {
      // Clear interval if timer not running
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    // Start interval
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1 && !timerTriggeredRef.current) {
          timerTriggeredRef.current = true;
          submitAnswer();
          return 0;
        }
        return prevTimeLeft - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerRunning, hasQuestions]); // Removed submitAnswer from dependencies to avoid closure issues

  const finishInterview = useCallback(async () => {
    console.log("🏁 Finishing interview...");
    
    // Cleanup before finishing
    stopRecognition();
    setTimerRunning(false);
    window.speechSynthesis.cancel();
    
    try {
      const result = await axios.post(
        `${ServerUrl}/api/interview/finish`,
        {
          interviewId,
        },
        { withCredentials: true }
      );
      console.log("✅ Interview finished successfully:", result.data);
      if (onFinish) onFinish(result.data);
    } catch (e) {
      console.log("Finishing error: ", e);
      if (onFinish) {
        onFinish({ interviewId, questions, error: e?.message || "Finish request failed" });
      }
    }
  }, [interviewId, onFinish, questions, stopRecognition]);

  const submitAnswer = useCallback(async () => {
    if (isSubmmiting) return;

    console.log("📤 Submitting answer...");

    try {
      setIsSubmmiting(true);

      // 1. Stop recognition immediately
      stopRecognition();
      
      // 2. Stop timer
      setTimerRunning(false);

      // 3. Submit answer to backend
      const result = await axios.post(
        `${ServerUrl}/api/interview/submit-answer`,
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken:
            (currentQuestion?.timeLimit || 60) -
            timeLeft,
        },
        {
          withCredentials: true,
        }
      );
      console.log("✅ Answer submitted, feedback received:", result.data);
      setFeedback(result.data.feedback);

      // 4. AI speaks feedback
      if (result.data.feedback) {
        await speakText(result.data.feedback);
      }

      // 5. Last question logic
      if (currentIndex === totalQuestions - 1) {
        await speakText("That concludes our interview. Thank you for taking the time to speak with me today. I appreciate your thoughtful responses and the effort you put into each question. Your interview has been successfully completed, and your performance report is now being generated. I wish you all the best in your future endeavors. Have a great day!");
        await finishInterview();
      } else {
        // 6. Wait 1.5s, then move to next question
        console.log("⏳ Waiting 1.5s before next question...");
        await new Promise(r => setTimeout(r, 1500));
        
        const nextIndex = currentIndex + 1;

        // 7. Reset UI
        setAnswer("");
        setFeedback("");
        timerTriggeredRef.current = false;
        setCurrentIndex(nextIndex);

        // 8. AI speaks next question
        await speakText(questions[nextIndex]?.question);

        // 9. Wait 400ms after AI finishes
        console.log("⏳ Waiting 400ms after AI speech...");
        await new Promise(r => setTimeout(r, 400));

        // 10. Clear transcript
        clearTranscript();

        // 11. Reset and start timer
        setTimeLeft(questions[nextIndex]?.timeLimit || 60);
        setTimerRunning(true);

        // 12. Start recognition
        startRecognition();
      }
    } catch (error) {
      console.error("❌ Submit Error:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
      }
    } finally {
      setIsSubmmiting(false);
    }
  }, [answer, currentIndex, currentQuestion, finishInterview, interviewId, isSubmmiting, questions, speakText, timeLeft, totalQuestions, stopRecognition, startRecognition, clearTranscript]);

  // ============================================================================
  // COMPONENT UNMOUNT CLEANUP
  // ============================================================================
  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting - cleaning up all resources");
      isMountedRef.current = false;
      
      // Stop speech synthesis and clear keep-alive interval
      window.speechSynthesis.cancel();
      if (speechKeepAliveRef.current) {
        clearInterval(speechKeepAliveRef.current);
        speechKeepAliveRef.current = null;
      }

      // Stop recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error stopping recognition during unmount:", e);
        }
      }

      // Clear timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // ============================================================================
  // JSX RENDER
  // ============================================================================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-screen h-screen bg-[#E8F5FD] overflow-hidden p-4"
    >
      <div className="h-full grid grid-cols-[340px_minmax(0,1fr)] gap-4">

        {/* LEFT PANEL */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-4 h-full min-h-0"
        >

          {/* AI Avatar */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-3xl overflow-hidden shadow-sm scale-99"
          >
            <video
              ref={videoRef}
              playsInline
              preload="auto"
              className="w-full h-52 object-cover"
            >
              <source
                src={
                  voiceGender === "female"
                    ? femaleVideo
                    : maleVideo
                }
                type="video/mp4"
              />
            </video>
          </motion.div>

          <AnimatePresence mode="wait">
            {isAIPlaying && subtitle && (
              <motion.div
                key={subtitle}
                initial={{
                  opacity: 0,
                  y: 15,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -15,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="bg-white rounded-3xl shadow-sm p-4 text-center"
              >
                <p className="text-sm text-gray-700 leading-relaxed">
                  {subtitle}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Card */}
          <motion.div
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            className="bg-white rounded-3xl p-5 shadow-sm flex flex-col flex-1 min-h-0"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-600">
                Interview Status
              </h3>

              {isAIPlaying && (
                <motion.span
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="text-green-600 text-sm font-semibold"
                >
                  {voiceGender === "male"
                    ? "David is speaking..."
                    : "Jenny is speaking..."}
                </motion.span>
              )}
            </div>

            {/* Start Button (only if interview not started) */}
            {!interviewStarted && !isIntroPhase === false && (
              <div className="flex-1 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startInterview}
                  disabled={!!startError}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50"
                >
                  {startError ? "Error: Check Console" : "Start Interview"}
                </motion.button>
              </div>
            )}
            {startError && !interviewStarted && (
              <p className="text-red-500 text-sm mt-4">{startError}</p>
            )}

            <div className="flex-1 min-h-0" />

            <div className="flex justify-center  mb-8">
              <motion.div
                animate={
                  timeLeft <= 10
                    ? {
                      scale: [1, 1.08, 1],
                    }
                    : {}
                }
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                }}
                className="relative w-35 h-35"
              >
                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 128 128"
                >
                  {/* Background Ring */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="7"
                    fill="none"
                  />

                  {/* Progress Ring */}
                  <motion.circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke={timerColor}
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference - progress
                    }
                    strokeLinecap="round"
                    animate={{
                      stroke: timerColor,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={timeLeft}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className={`text-3xl font-bold ${percentage > 60
                      ? "text-emerald-600"
                      : percentage > 30
                        ? "text-orange-500"
                        : "text-red-500"
                      }`}
                  >
                    {timeLeft}s
                  </motion.span>

                  <span className="text-xs text-gray-500">
                    Remaining
                  </span>
                </div>

                {/* Pulsing Warning */}
                {percentage <= 20 && (
                  <motion.div
                    animate={{
                      scale: [1, 1.4],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 rounded-full border-4 border-red-400"
                  />
                )}
              </motion.div>
            </div>

            {!subtitle && (
              <div className="border-t border-gray-400 mt-8 pt-6 flex justify-between">
                <div className="text-center">
                  <motion.h2
                    key={currentIndex}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-emerald-600"
                  >
                    {currentIndex + 1}
                  </motion.h2>

                  <p className="text-sm text-gray-500">
                    current Question
                  </p>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-emerald-600">
                    {totalQuestions}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Total Questions
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="relative bg-white rounded-3xl shadow-sm p-6 flex flex-col"
        >


          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl font-bold text-emerald-500 mb-5"
          >
            AI Smart Interview
          </motion.h1>

          {/* Start Interview Button - Large */}
          {!interviewStarted && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Ready to Start Your Interview?
                </h2>
                <p className="text-gray-600">
                  Click below to begin and grant microphone access.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startInterview}
                disabled={!!startError}
                className="px-12 py-6 bg-black hover:bg-gray-900 text-white font-bold text-xl rounded-2xl shadow-2xl disabled:opacity-50"
              >
                Start Interview
              </motion.button>
              {startError && (
                <p className="text-red-500 text-sm">{startError}</p>
              )}
            </div>
          )}

          {interviewStarted && !hasQuestions ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl p-5 bg-gray-50"
            >
              <p className="text-sm text-gray-500">
                Interview data was loaded, but no questions are available.
              </p>
              <p className="mt-3 text-gray-700">
                Please go back and restart the interview.
              </p>
            </motion.div>
          ) : (
            interviewStarted && !isIntroPhase && !feedback && (
              <motion.div
                key={currentIndex}
                initial={{
                  opacity: 0,
                  y: 30
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.4
                }}
                className="border-gray-300 border rounded-2xl p-5 bg-gray-50"
              >
                <p className="text-sm text-gray-500">
                  Question {currentIndex + 1} of {totalQuestions}
                </p>

                <h2 className="text-lg font-semibold mt-2 text-gray-800">
                  {questions[currentIndex]?.question}
                </h2>
              </motion.div>
            )
          )}

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-emerald-700">
                    Interview Feedback
                  </h3>

                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    AI Generated
                  </span>
                </div>

                <p className="text-gray-700 text-sm leading-6">
                  {feedback}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer Area */}
          {interviewStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 mt-5"
            >
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={!hasQuestions}
                className="w-full h-full border text-lg font-semibold border-gray-300 bg-gray-50 rounded-2xl p-4 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </motion.div>
          )}

          {interviewStarted && (
            <div className="flex items-center gap-3 mt-4">

              {/* Microphone Button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecording}
                animate={
                  isRecording
                    ? {
                      scale: [1, 1.15, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(255, 0, 0, 0.7)",
                        "0 0 0 15px rgba(255, 0, 0, 0)",
                        "0 0 0 0 rgba(255, 0, 0, 0.01)",
                      ],
                    }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: isRecording ? Infinity : 0,
                }}
                className="relative w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl"
              >
                {isRecording ? (
                  <FaMicrophone size={24} />
                ) : (
                  <FaMicrophoneSlash size={24} />
                )}
                {isRecording && (
                  <motion.span
                    animate={{
                      scale: [1, 1.8],
                      opacity: [0.7, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 rounded-full border-2 border-red-500"
                  />
                )}
              </motion.button>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitAnswer}
                disabled={!hasQuestions || isSubmmiting}
                className="flex-1 h-14 rounded-2xl bg-black hover:bg-gray-900 cursor-pointer text-white font-semibold shadow-lg disabled:opacity-50"
              >
                {isSubmmiting
                  ? "Submitting..."
                  : currentIndex === totalQuestions - 1
                    ? "Finish Interview"
                    : "Submit Answer"}
              </motion.button>
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}

export default Step2;
