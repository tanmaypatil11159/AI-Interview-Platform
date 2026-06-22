import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ServerUrl } from "../utils/constants";
import femaleVideo from "../assets/female-ai.mp4";
import maleVideo from "../assets/male-ai.mp4";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

function Step2({ interviewData, onFinish }) {

  const { interviewId, questions = [], userName } = interviewData || {};
  const [isIntroPhase, setIsIntroPhase] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const [isAIPlaying, setIsAIPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [isSubmmiting, setIsSubmmiting] = useState(false)
  const [voiceGender, setVoiceGender] = useState("male")
  const [subtitle, setSubtitle] = useState("")

  const videoRef = useRef(null)
  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length;

useEffect(() => {
  if (timeLeft <= 0) {
    submitAnswer();
    return;
  }

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
    const timeLimit = currentQuestion?.timeLimit || 30;
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

  const toggleRecording = () => {
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
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / 30) * circumference;

useEffect(() => {
  if (!questions.length) return;

  setTimeLeft(
    questions[currentIndex]?.timeLimit || 60
  );
}, [currentIndex, questions]);




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

const submitAnswer = async () => {
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

    setFeedback(result.data.feedback);

    if (result.data.feedback) {
      await speakText(result.data.feedback);
    }

    if (currentIndex === totalQuestions - 1) {
      await finishInterview();
    } else {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setAnswer("");
        setFeedback("");
      }, 1500);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsSubmmiting(false);
  }
};


const handleNext = async () => {
  if (currentIndex + 1 >= questions.length) {
    finishInterview();
    return;
  }

  setAnswer("");
  setFeedback("");

  setCurrentIndex((prev) => prev + 1);
};

  const finishInterview = async() => {
    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish",{
        interviewId,
      },{withCredentials:true})
      onFinish(result.data)
    } catch (e) {

    }
  }
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