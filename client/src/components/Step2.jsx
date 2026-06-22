import React, { useState, useEffect, useRef } from "react";
import { Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ServerUrl } from "../utils/constants";
import femaleVideo from "../assets/female-ai.mp4";
import maleVideo from "../assets/male-ai.mp4";

function Step2({ interviewData, onFinish }) {

  const { interviewId, questions = [], userName } = interviewData || {};
  const [isIntroPhase, setIsIntroPhase] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const recognitionRef = useRef(null)
  const [isAIPlaying, setIsAIPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [isSubmmiting, setIsSubmmiting] = useState(false)
  const [voiceGender, setVoiceGender] = useState("female")
  const [subtitle, setSubtitle] = useState("")

  const videoRef = useRef(null)
  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = () => {
    submitCurrentAnswer();
  };

  const submitCurrentAnswer = async () => {
    if (!interviewId) {
      alert("Missing interview id");
      return;
    }

    const questionIndex = currentIndex;
    const timeLimit = currentQuestion?.timeLimit || 60;
    const timeTaken = Math.max(0, timeLimit - timeLeft);

    try {
      setIsSubmmiting(true);

      await axios.post(
        `${ServerUrl}/api/interview/submit-answer`,
        {
          interviewId,
          questionIndex,
          answer,
          timeTaken,
        },
        { withCredentials: true }
      );

      setAnswer("");

      if (currentIndex < totalQuestions - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setTimeLeft(questions[nextIndex]?.timeLimit || 60);
      } else {
        // finish interview
        const finishRes = await axios.post(
          `${ServerUrl}/api/interview/finish`,
          { interviewId },
          { withCredentials: true }
        );

        if (onFinish) onFinish(finishRes.data);
      }
    } catch (err) {
      console.error("Submit Answer Error:", err?.response || err);
      alert("Failed to submit answer. Check console.");
    } finally {
      setIsSubmmiting(false);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
  }

  const toggleRecording = () => {
    if (!recognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    if (!isRecording) {
      recognition.start();

      recognition.onresult = (event) => {
        let transcript = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          transcript += event.results[i][0].transcript;
        }

        setAnswer(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    } else {
      recognition.stop();
    }

    setIsRecording(!isRecording);
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / 30) * circumference;

  useEffect(() => {
    if (questions && questions.length) {
      setTimeLeft(questions[currentIndex]?.timeLimit || 60);
    }
  }, [questions, currentIndex]);


  if (!interviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Preparing interview...</h2>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  const hasQuestions = Array.isArray(questions) && questions.length > 0;

  useEffect(() => {
    const loadVoices = () => {
  const voices = window.speechSynthesis.getVoices();

  let voice = null;

  if (voiceGender === "male") {
    voice =
    voices.find((v) =>
      v.name.includes("David")
    ) ||
    voices.find((v) =>
      v.name.includes("Mark")
  ) ||
      voices.find((v) =>
        v.name.includes("George")
      );
  } else {
    voice =
      voices.find((v) =>
        v.name.includes("Zira")
      ) ||
      voices.find((v) =>
        v.name.includes("Hazel")
      ) ||
      voices.find((v) =>
        v.name.includes("Susan")
      );
  }

  console.log(
    "Selected Voice:",
    voice?.name
  );

  setSelectedVoice(voice || voices[0]);
};

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [voiceGender]);


  const speakText = (text) => {
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
        setSubtitle(humanText);

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
  };


  useEffect(() => {
    if (!selectedVoice) return;

    const runIntro = async () => {
      if (!isIntroPhase) return;

      await speakText(
        `Hi ${userName}, I am ${voiceGender === "male" ? "David" : "Jennie"}. it's great to meet you today. I hope you're feeling confident and ready.`
      );

      await speakText(
        "I'll ask you a few questions. Just answer naturally, one at a time. Let's begin."
      );

      setIsIntroPhase(false);
    };

    runIntro();
  }, [selectedVoice]);


  useEffect(() => {
    if (
      isIntroPhase ||
      !selectedVoice ||
      !currentQuestion?.question
    ) {
      return;
    }

    speakText(currentQuestion.question);
  }, [
    currentIndex,
    selectedVoice,
    isIntroPhase
  ]);

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
                animate={{
                  scale: [1, 1.04, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity
                }}
                className="relative w-32 h-32"
              >
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />

                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference - progress
                    }
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-700">
                    {timeLeft}s
                  </span>
                </div>
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
          )}

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
              className="w-full h-full border rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      "0 0 0px rgba(239,68,68,0.5)",
                      "0 0 20px rgba(239,68,68,0.8)",
                      "0 0 0px rgba(239,68,68,0.5)"
                    ]
                  }
                  : {}
              }
              transition={{
                duration: 1,
                repeat: isRecording ? Infinity : 0
              }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
      ${isRecording
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700"
                }`}
            >
              <Mic size={24} />
            </motion.button>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
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