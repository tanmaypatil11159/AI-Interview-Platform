import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ServerUrl } from "../utils/constants";
import femaleVideo from "../assets/female-ai.mp4";
import maleVideo from "../assets/male-ai.mp4";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

function Step2({ interviewData, onFinish }) {

  const { interviewId, questions = [], userName } = interviewData || {};
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmmiting, setIsSubmmiting] = useState(false);
  const voiceGender = "male";
  const [subtitle, setSubtitle] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const timerTriggeredRef = useRef(false);

  const videoRef = useRef(null)
  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length;



  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognitionRef.current = recognition;
  }, []);

  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    if (!isRecording) {
      recognition.start();

      recognition.onresult = (event) => {
        let interim = "";
        let final = finalTranscriptRef.current;

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          if (event.results[i].isFinal) {
            final +=
              event.results[i][0].transcript + " ";
          } else {
            interim +=
              event.results[i][0].transcript;
          }
        }

        finalTranscriptRef.current = final;

        setAnswer(final + interim);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setIsRecording(true);
    } else {
      finalTranscriptRef.current = answer + " ";

      recognition.stop();

      setIsRecording(false);
    }
  }, [answer, isRecording]);

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

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

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

      if (voices.length > 0) {
        setSelectedVoice(selectedVoiceCandidate || voices[0]);
      }
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [voiceGender]);


  const speakText = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch =
        voiceGender === "female" ? 1.05 : 0.9;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        setSubtitle(text);

        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      };

      utterance.onend = () => {
        setIsAIPlaying(false);
        setSubtitle("");

        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }

        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [selectedVoice, voiceGender]);
useEffect(() => {
  if (!selectedVoice) return;

  const runIntro = async () => {
    if (!isIntroPhase) return;

    await speakText(
      `Hi ${userName}, I am ${
        voiceGender === "male" ? "David" : "Jennie"
      }. It's great to meet you today. I hope you're feeling confident and ready.`
    );

    await speakText(
      "I'll ask you a few questions. Just answer naturally, one at a time. Let's begin."
    );

    setIsIntroPhase(false);

    if (questions?.length > 0) {
      setCurrentIndex(0);

      await speakText(
        questions[0]?.question
      );

      setTimeLeft(
        questions[0]?.timeLimit || 60
      );

      setTimerRunning(true);

      toggleRecording();
    }
  };

  runIntro();
}, [selectedVoice, isIntroPhase, questions, userName, voiceGender, speakText, toggleRecording]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      console.log("Available Voices:");
      voices.forEach((voice) => {
        console.log(voice.name);
      });
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const finishInterview = useCallback(async () => {
    try {
      const result = await axios.post(
        `${ServerUrl}/api/interview/finish`,
        {
          interviewId,
        },
        { withCredentials: true }
      );
      console.log(result.data);
      if (onFinish) onFinish(result.data);
    } catch (e) {
      console.log("Finishing error: ", e);
      if (onFinish) {
        onFinish({ interviewId, questions, error: e?.message || "Finish request failed" });
      }
    }
  }, [interviewId, onFinish, questions]);

  const submitAnswer = useCallback(async () => {
    if (isSubmmiting) return;

    try {
      setIsSubmmiting(true);

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
      console.log(result.data);
      setFeedback(result.data.feedback);

      if (result.data.feedback) {
        await speakText(result.data.feedback);
      }

      if (currentIndex === totalQuestions - 1) {
        await finishInterview();
      } else {
        setTimeout(() => {
          const nextIndex = currentIndex + 1;

          setCurrentIndex(nextIndex);
          setAnswer("");
          setFeedback("");
          timerTriggeredRef.current = false;

          setTimeLeft(
            questions[nextIndex]?.timeLimit || 60
          );
        }, 1500);
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
  }, [answer, currentIndex, currentQuestion, finishInterview, interviewId, isSubmmiting, questions, speakText, timeLeft, totalQuestions]);


useEffect(() => {
    if (!timerRunning || !hasQuestions) return;

    if (timeLeft <= 0 && !timerTriggeredRef.current) {
      timerTriggeredRef.current = true;
      submitAnswer();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, hasQuestions, timerRunning, submitAnswer]);
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);




  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-screen h-screen bg-[#f5faf8] overflow-hidden p-4"
    >
      <div className="h-full grid grid-cols-[320px_1fr] gap-4">

        {/* LEFT PANEL */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-4"
        >



          {/* AI Avatar */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-3xl overflow-hidden shadow-sm scale-99"
          >
            <video
              ref={videoRef}
              muted
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
                className="bg-white border rounded-2xl shadow-sm p-4"
              >
                <p className="text-sm text-gray-700 text-center leading-relaxed">
                  {subtitle}
                </p>
              </motion.div>
            )}
          </AnimatePresence>


          {/* Status Card */}
          <motion.div

            transition={{
              duration: 3,
              repeat: Infinity
            }}
            className="bg-white border rounded-3xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-600">
                Interview Status
              </h3>

              {isAIPlaying &&
                <motion.span
                  animate={{
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                  className="text-green-600 text-sm font-semibold"
                >
                  {voiceGender === "male" ? "David is speaking..." : "Jenny is speaking..."}
                </motion.span>

              }
            </div>



            {/* Timer */}
            <div className="flex justify-center mt-8">
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
                className="relative w-36 h-36"
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

            <div className="border-t mt-8 pt-6 flex justify-between">
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
          </motion.div>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-white border rounded-3xl shadow-sm p-6 flex flex-col"
        >
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-emerald-600 mb-5"
          >
            AI Smart Interview
          </motion.h1>

          {!hasQuestions ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="border rounded-2xl p-5 bg-gray-50"
            >
              <p className="text-sm text-gray-500">
                Interview data was loaded, but no questions are available.
              </p>
              <p className="mt-3 text-gray-700">
                Please go back and restart the interview.
              </p>
            </motion.div>
          ) : (
            !isIntroPhase && (
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
                className="border rounded-2xl p-5 bg-gray-50"
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
              className="w-full h-full border rounded-2xl p-4 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </motion.div>

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
                      "0 0 0 0 rgba(0,0,0,0.7)",
                      "0 0 0 15px rgba(0,0,0,0)",
                      "0 0 0 0 rgba(0,0,0,0)",
                    ],
                  }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: isRecording ? Infinity : 0,
              }}
              className="relative w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-xl"
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
                  className="absolute inset-0 rounded-full border-4 border-black"
                />
              )}
            </motion.button>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submitAnswer}
              disabled={!hasQuestions || isSubmmiting}
              className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg disabled:opacity-50"
            >
              {isSubmmiting
                ? "Submitting..."
                : currentIndex === totalQuestions - 1
                  ? "Finish Interview"
                  : "Submit Answer"}
            </motion.button>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default Step2;