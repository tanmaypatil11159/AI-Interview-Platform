﻿﻿﻿﻿import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ServerUrl } from "../utils/constants";
import femaleVideo from "../assets/female-ai.mp4";
import maleVideo from "../assets/male-ai.mp4";
import { FaMicrophone, FaMicrophoneSlash, FaExclamationTriangle } from "react-icons/fa";

function Step2({ interviewData, onFinish }) {
  const { interviewId, questions = [], userName, mode } = interviewData || {};
  const voiceGender = "male";

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmmiting, setIsSubmmiting] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [startError, setStartError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isRequestingFullscreen, setIsRequestingFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const timerTriggeredRef = useRef(false);
  const videoRef = useRef(null);
  const isMountedRef = useRef(true);
  const isAISpeakingRef = useRef(false);
  const isRecognitionActiveRef = useRef(false);
  const isManualPauseRef = useRef(false);
  const timerIntervalRef = useRef(null);
  const speechKeepAliveRef = useRef(null);
  const restartAttemptsRef = useRef(0);
  const MAX_RESTART_ATTEMPTS = 3;

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Calculate timer stage
  const getTimerStage = () => {
    if (!currentQuestion) return "green";
    const timeLimit = currentQuestion.timeLimit || 180;
    const percentage = (elapsedTime / timeLimit) * 100;
    if (percentage <= 100) return "green";
    if (percentage <= 125) return "yellow";
    return "red";
  };

  const timerStage = getTimerStage();
  const questionTimeLimit = currentQuestion?.timeLimit || 180;
  const elapsedPercentage = (elapsedTime / questionTimeLimit) * 100;

  // Timer color based on stage
  const timerColor =
    timerStage === "green"
      ? "#10b981"
      : timerStage === "yellow"
      ? "#f59e0b"
      : "#ef4444";

  // Progress is based on elapsed time
  const progress = Math.max(
    0,
    Math.min(
      2 * Math.PI * 45,
      (elapsedPercentage / 100) * (2 * Math.PI * 45)
    )
  );

  const hasQuestions = Array.isArray(questions) && questions.length > 0;

  // Helper function to record interview activity
  const recordActivity = useCallback(async (type, details) => {
    if (!interviewId || !interviewStarted) return;
    try {
      await axios.post(
        `${ServerUrl}/api/interview/record-activity`,
        {
          interviewId,
          type,
          details
        },
        { withCredentials: true }
      );
    } catch (e) {
      console.error("Failed to record activity:", e);
    }
  }, [interviewId, interviewStarted]);

  // Helper function to request fullscreen
  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.documentElement.requestFullscreen) {
        throw new Error("Fullscreen API is not supported in this browser.");
      }
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      return true;
    } catch (e) {
      console.error("Fullscreen request failed:", e);
      return false;
    }
  }, []);

  // Helper function to check fullscreen status
  const checkFullscreen = useCallback(() => {
    const fullscreenElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
    return !!fullscreenElement;
  }, []);

  // Helper functions (startRecognition, stopRecognition, clearTranscript, speakText) declared before startInterview
  const startRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.error("SpeechRecognition not initialized");
      return;
    }
    if (isAISpeakingRef.current) {
      console.log("Cannot start recognition - AI is speaking");
      return;
    }
    if (isRecognitionActiveRef.current) {
      console.log("Recognition already active, skipping start()");
      return;
    }
    try {
      console.log("Starting recognition...");
      isManualPauseRef.current = false;
      recognition.start();
      restartAttemptsRef.current = 0;
    } catch (error) {
      if (error.name === "InvalidStateError") {
        console.warn("InvalidStateError: Recognition already running or in progress");
      } else {
        console.error("Error starting recognition:", error);
      }
    }
  }, []);

  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.error("SpeechRecognition not initialized");
      return;
    }
    if (!isRecognitionActiveRef.current) {
      console.log("Recognition already inactive, skipping stop()");
      return;
    }
    try {
      console.log("Stopping recognition...");
      recognition.stop();
    } catch (error) {
      console.error("Error stopping recognition:", error);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    console.log("Clearing transcript buffer");
    finalTranscriptRef.current = "";
    setAnswer("");
  }, []);

  const speakText = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        console.warn("Speech synthesis not available");
        resolve();
        return;
      }
      console.log(`AI speaking: "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"`);
      window.speechSynthesis.cancel();
      isAISpeakingRef.current = true;
      stopRecognition();
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = 0.92;
      utterance.pitch = voiceGender === "female" ? 1.05 : 0.9;
      utterance.volume = 1;

      utterance.onstart = () => {
        console.log("AI started speaking");
        if (isMountedRef.current) {
          setIsAIPlaying(true);
          setSubtitle(text);
        }
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.loop = true;
          videoRef.current.play().catch((err) => {
            console.warn("Could not play avatar video:", err);
          });
        }
        speechKeepAliveRef.current = setInterval(() => {
          if (!isAISpeakingRef.current) {
            clearInterval(speechKeepAliveRef.current);
            return;
          }
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }, 14000);
      };

      utterance.onend = () => {
        console.log("AI finished speaking");
        isAISpeakingRef.current = false;
        if (speechKeepAliveRef.current) {
          clearInterval(speechKeepAliveRef.current);
          speechKeepAliveRef.current = null;
        }
        if (isMountedRef.current) {
          setIsAIPlaying(false);
          setSubtitle("");
        }
        if (videoRef.current) {
          videoRef.current.loop = false;
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        resolve();
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        isAISpeakingRef.current = false;
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

      window.speechSynthesis.speak(utterance);
    });
  }, [selectedVoice, voiceGender, stopRecognition]);

  // Update startInterview to first request fullscreen
  const startInterview = useCallback(async () => {
    if (interviewStarted) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStartError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave.");
      return;
    }

    if (!window.speechSynthesis || typeof window.speechSynthesis.speak !== "function") {
      setStartError("Speech synthesis is not available in this browser.");
      return;
    }

    if (!voicesLoaded || !selectedVoice) {
      setStartError("Voice setup is still loading. Please try again in a moment.");
      return;
    }

    try {
      console.log("Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      console.log("Microphone permission granted");
    } catch (err) {
      console.error("Microphone permission denied:", err);
      setStartError("Microphone permission denied. Please allow microphone access to continue.");
      return;
    }

    setIsRequestingFullscreen(true);
    const fullscreenSuccess = await requestFullscreen();
    setIsRequestingFullscreen(false);

    if (!fullscreenSuccess) {
      setStartError("Full Screen Mode is required to continue your interview. Please enable Full Screen Mode and try again.");
      return;
    }

    setStartError("");
    setInterviewStarted(true);
    console.log("Interview started");

    await speakText(
      `Hi ${userName}, I am ${voiceGender === "male" ? "David" : "Jennie"}. It's great to meet you today. I hope you're feeling confident and ready.`
    );

    if (mode === "Technical") {
      await speakText(
        "Today we'll be conducting a technical interview. I'll ask you questions related to your technical knowledge, problem solving skills, and project experience. Take your time, explain your thought process clearly, and answer each question one at a time. Let's begin."
      );
    } else {
      await speakText(
        "Today we'll be conducting an HR interview. I'll ask you questions about your background, communication skills, teamwork, career goals, and professional experiences. Answer naturally and be yourself. Let's begin."
      );
    }

    setIsIntroPhase(false);

    if (questions?.length > 0) {
      setCurrentIndex(0);
      await speakText(questions[0]?.question);
      console.log("Waiting 400ms...");
      await new Promise((r) => setTimeout(r, 400));
      clearTranscript();
      setTimeLeft(questions[0]?.timeLimit || 180);
      setElapsedTime(0);
      setTimerRunning(true);
      timerTriggeredRef.current = false;
      startRecognition();
    }
  }, [
    interviewStarted,
    mode,
    questions,
    selectedVoice,
    speakText,
    userName,
    voiceGender,
    startRecognition,
    clearTranscript,
    voicesLoaded,
    requestFullscreen
  ]);

  // Auto-start interview when interviewData is available
  useEffect(() => {
    if (interviewData && !interviewStarted) {
      startInterview();
    }
  }, [interviewData, interviewStarted, startInterview]);

  // INITIALIZATION: SETUP SPEECH RECOGNITION ONCE FOR ENTIRE LIFECYCLE
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition API is not supported in this browser");
      if (isMountedRef.current) {
        setStartError(
          "Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Brave."
        );
      }
      return;
    }

    console.log("Initializing SpeechRecognition instance (once for lifecycle)");
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening until explicitly stopped
    recognition.interimResults = true; // Get results as user is speaking
    recognition.lang = "en-IN";
    recognition.onstart = () => {
      console.log("SpeechRecognition started listening");
      isRecognitionActiveRef.current = true;
      if (isMountedRef.current) {
        setIsRecording(true);
      }
    };

    recognition.onend = () => {
      console.log("SpeechRecognition session ended");
      isRecognitionActiveRef.current = false;
      if (isMountedRef.current) {
        setIsRecording(false);
      }
      if (
        isMountedRef.current &&
        !isAISpeakingRef.current &&
        interviewStarted &&
        !isSubmmiting &&
        !isManualPauseRef.current &&
        restartAttemptsRef.current < MAX_RESTART_ATTEMPTS
      ) {
        console.log(
          `Auto-restarting recognition (attempt ${restartAttemptsRef.current + 1})`
        );
        restartAttemptsRef.current += 1;
        setTimeout(() => {
          try {
            if (
              recognition &&
              !isRecognitionActiveRef.current &&
              !isAISpeakingRef.current &&
              !isManualPauseRef.current
            ) {
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

    recognition.onerror = (event) => {
      console.error(`SpeechRecognition error: ${event.error}`);
      switch (event.error) {
        case "not-allowed":
          console.error("Microphone permission denied. User must grant microphone access.");
          if (isMountedRef.current) {
            setStartError("Microphone permission denied. Please allow microphone access to continue.");
          }
          break;
        case "audio-capture":
          console.error("No microphone found or audio capture unavailable.");
          if (isMountedRef.current) {
            setStartError("No microphone detected. Please check your microphone connection.");
          }
          break;
        case "no-speech":
          console.warn("No speech detected within the timeout period. Waiting for speech...");
          break;
        case "network":
          console.error("Network error during speech recognition.");
          if (isMountedRef.current) {
            setStartError("Network error. Please check your internet connection.");
          }
          break;
        case "aborted":
          console.log("Speech recognition was aborted.");
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

    recognition.onresult = (event) => {
      console.log(
        `SpeechRecognition result: ${event.results.length} result(s), resultIndex: ${event.resultIndex}`
      );
      let interim = "";
      let final = finalTranscriptRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        if (isFinal) {
          console.log(`Final result: "${transcript}"`);
          final += transcript + " ";
        } else {
          console.log(`Interim result: "${transcript}"`);
          interim += transcript;
        }
      }
      finalTranscriptRef.current = final;
      if (isMountedRef.current) {
        setAnswer(final + interim);
      }
    };

    recognition.onaudiostart = () => {
      console.log("Audio capture started");
    };

    recognition.onspeechstart = () => {
      console.log("Speech detected");
    };

    recognition.onnomatch = () => {
      console.warn("No speech match detected");
    };

    recognitionRef.current = recognition;
    console.log("SpeechRecognition setup complete with all event listeners");

    return () => {
      console.log("Cleaning up SpeechRecognition on unmount");
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
  }, []);

  // INITIALIZATION: LOAD VOICES FOR SPEECH SYNTHESIS
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        console.log("Voices not yet loaded, waiting for onvoiceschanged event...");
        return;
      }
      console.log(`${voices.length} voices loaded:`);
      voices.forEach((voice) => {
        console.log(`  - ${voice.name} (${voice.lang}${voice.default ? " - DEFAULT" : ""})`);
      });
      let selectedVoiceCandidate;
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
      const finalVoice =
        selectedVoiceCandidate ||
        voices.find((v) => v.default) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
      if (isMountedRef.current) {
        setSelectedVoice(finalVoice);
        setVoicesLoaded(true);
        setStartError("");
        console.log(`Selected voice: ${finalVoice.name}`);
      }
    };

    loadVoices();
    const voicesChangedListener = () => {
      console.log("Voices changed event fired - rechecking voices");
      loadVoices();
    };
    window.speechSynthesis.onvoiceschanged = voicesChangedListener;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceGender]);

  // FULLSCREEN & ACTIVITY LISTENERS
  useEffect(() => {
    if (!interviewStarted) return;
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = checkFullscreen();
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen && interviewStarted) {
        console.log("User exited fullscreen");
        recordActivity("FULLSCREEN_EXIT", "User exited fullscreen mode");
        setWarningMessage("You have exited Full Screen Mode. Please return to continue your interview. This activity has been recorded.");
        setShowWarning(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && interviewStarted) {
        console.log("Tab switched");
        recordActivity("TAB_SWITCH", "User switched to another tab");
        setWarningMessage("You have switched tabs. Please return to continue your interview. This activity has been recorded.");
        setShowWarning(true);
      }
    };

    const handleWindowBlur = () => {
      if (interviewStarted) {
        console.log("Window blurred");
        recordActivity("WINDOW_BLUR", "Window lost focus");
        setWarningMessage("Your window has lost focus. Please return to continue your interview. This activity has been recorded.");
        setShowWarning(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    handleFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [interviewStarted, checkFullscreen, recordActivity]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      console.log("Pausing recognition manually");
      isManualPauseRef.current = true;
      stopRecognition();
    } else {
      console.log("Resuming recognition manually");
      isManualPauseRef.current = false;
      startRecognition();
    }
  }, [isRecording, startRecognition, stopRecognition]);

  useEffect(() => {
    if (!timerRunning || !hasQuestions) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      setElapsedTime((prevElapsed) => prevElapsed + 1);
    }, 1000);
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerRunning, hasQuestions]);

  const finishInterview = useCallback(async () => {
    console.log("Finishing interview...");
    stopRecognition();
    setTimerRunning(false);
    window.speechSynthesis.cancel();
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
    } catch (e) {
      console.error("Failed to exit fullscreen:", e);
    }
    try {
      const result = await axios.post(
        `${ServerUrl}/api/interview/finish`,
        {
          interviewId
        },
        { withCredentials: true }
      );
      console.log("Interview finished successfully:", result.data);
      if (onFinish) onFinish(result.data);
    } catch (e) {
      console.log("Finishing error:", e);
      if (onFinish) {
        onFinish({ interviewId, questions, error: e?.message || "Finish request failed" });
      }
    }
  }, [interviewId, onFinish, questions, stopRecognition]);

  const submitAnswer = useCallback(async () => {
    if (isSubmmiting) return;
    console.log("Submitting answer...");
    try {
      setIsSubmmiting(true);
      stopRecognition();
      setTimerRunning(false);
      const result = await axios.post(
        `${ServerUrl}/api/interview/submit-answer`,
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: elapsedTime
        },
        {
          withCredentials: true
        }
      );
      console.log("Answer submitted, feedback received:", result.data);
      setFeedback(result.data.feedback);
      if (result.data.feedback) {
        await speakText(result.data.feedback);
      }
      if (currentIndex === totalQuestions - 1) {
        await speakText(
          "That concludes our interview. Thank you for taking the time to speak with me today. I appreciate your thoughtful responses and the effort you put into each question. Your interview has been successfully completed, and your performance report is now being generated. I wish you all the best in your future endeavors. Have a great day!"
        );
        await finishInterview();
      } else {
        console.log("Waiting 1.5s before next question...");
        await new Promise((r) => setTimeout(r, 1500));
        const nextIndex = currentIndex + 1;
        setAnswer("");
        setFeedback("");
        timerTriggeredRef.current = false;
        setCurrentIndex(nextIndex);
        await speakText(questions[nextIndex]?.question);
        console.log("Waiting 400ms after AI speech...");
        await new Promise((r) => setTimeout(r, 400));
        clearTranscript();
        setTimeLeft(questions[nextIndex]?.timeLimit || 180);
        setElapsedTime(0);
        setTimerRunning(true);
        startRecognition();
      }
    } catch (error) {
      console.error("Submit Error:", error);
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
      }
    } finally {
      setIsSubmmiting(false);
    }
  }, [
    answer,
    currentIndex,
    finishInterview,
    interviewId,
    isSubmmiting,
    questions,
    speakText,
    totalQuestions,
    stopRecognition,
    startRecognition,
    clearTranscript,
    elapsedTime
  ]);

  useEffect(() => {
    return () => {
      console.log("Component unmounting - cleaning up all resources");
      isMountedRef.current = false;
      window.speechSynthesis.cancel();
      if (speechKeepAliveRef.current) {
        clearInterval(speechKeepAliveRef.current);
        speechKeepAliveRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error stopping recognition during unmount:", e);
        }
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-screen h-screen bg-[#E8F5FD] overflow-hidden p-4"
    >
      <div className="h-full grid grid-cols-[340px_minmax(0,1fr)] gap-4">
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-4 h-full min-h-0"
        >
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
                src={voiceGender === "female" ? femaleVideo : maleVideo}
                type="video/mp4"
              />
            </video>
          </motion.div>
          <AnimatePresence mode="wait">
            {isAIPlaying && subtitle && (
              <motion.div
                key={subtitle}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl shadow-sm p-4 text-center"
              >
                <p className="text-sm text-gray-700 leading-relaxed">{subtitle}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-white rounded-3xl p-5 shadow-sm flex flex-col flex-1 min-h-0"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-600">Interview Status</h3>
              {isAIPlaying && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-green-600 text-sm font-semibold"
                >
                  {voiceGender === "male" ? "David is speaking..." : "Jenny is speaking..."}
                </motion.span>
              )}
            </div>
            <div className="flex-1 min-h-0" />
            {timerStage === "yellow" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-2xl text-center"
              >
                <p className="text-yellow-800 text-sm font-medium">
                  You've exceeded the recommended time. You can continue if needed.
                </p>
              </motion.div>
            )}
            {timerStage === "red" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-center"
              >
                <p className="text-red-800 text-sm font-medium">
                  This question has taken significantly longer than recommended. Your submission is still accepted, but time will be considered in the evaluation.
                </p>
              </motion.div>
            )}
            <div className="flex justify-center mb-8">
              <motion.div
                animate={timeLeft <= 10 ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="relative w-35 h-35"
              >
                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 128 128"
                >
                  <circle
                    cx="64"
                    cy="64"
                    r={45}
                    stroke="#e5e7eb"
                    strokeWidth="7"
                    fill="none"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r={45}
                    stroke={timerColor}
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 - progress}
                    strokeLinecap="round"
                    animate={{ stroke: timerColor }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={timeLeft}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className={`text-3xl font-bold ${elapsedPercentage <= 100 ? "text-emerald-600" : elapsedPercentage <= 125 ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}
                  </motion.span>
                  <span className="text-xs text-gray-500">Elapsed</span>
                </div>
                {timerStage === "red" && (
                  <motion.div
                    animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
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
                  <p className="text-sm text-gray-500">current Question</p>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-emerald-600">{totalQuestions}</h2>
                  <p className="text-sm text-gray-500">Total Questions</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

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
                disabled={!!startError || isRequestingFullscreen}
                className="px-12 py-6 bg-black hover:bg-gray-900 text-white font-bold text-xl rounded-2xl shadow-2xl disabled:opacity-50"
              >
                {isRequestingFullscreen ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Preparing Interview...
                  </div>
                ) : (
                  "Start Interview"
                )}
              </motion.button>
              {startError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl max-w-md">
                  <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                    <FaExclamationTriangle />
                    {startError}
                  </p>
                </div>
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
          ) : interviewStarted && isIntroPhase ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl p-5 bg-gray-50"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Interview Starting...
                </h3>
                <p className="text-gray-600">
                  Please wait while the AI interviewer gets ready.
                </p>
              </div>
            </motion.div>
          ) : (
            interviewStarted && !isIntroPhase && !feedback && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
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
                <p className="text-gray-700 text-sm leading-6">{feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>

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
                          "0 0 0 0 rgba(255, 0, 0, 0.01)"
                        ]
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: isRecording ? Infinity : 0
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
                    animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-red-500"
                  />
                )}
              </motion.button>

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

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaExclamationTriangle className="text-yellow-600 text-xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Attention Required
                </h2>
              </div>
              <p className="text-gray-600 mb-8 text-center">
                {warningMessage}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  await requestFullscreen();
                  if (checkFullscreen()) {
                    setShowWarning(false);
                  }
                }}
                className="w-full py-4 bg-black hover:bg-gray-900 text-white font-bold rounded-2xl shadow-lg"
              >
                Return to Full Screen
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Step2;
