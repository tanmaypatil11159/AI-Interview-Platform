
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ServerUrl } from "../utils/constants";

import {
  UserRound,
  FileText,
  Mic,
  BarChart3,
  Upload,
  Home
} from "lucide-react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice"; // adjust path
import { useNavigate } from "react-router-dom";

function Step1({ onStart }) {
  const navigate = useNavigate()
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const features = [
    {
      icon: <UserRound size={18} />,
      text: "Choose your Role",
    },
    {
      icon: <Mic size={18} />,
      text: "Exsperence you having",
    },
    {
      icon: <BarChart3 size={18} />,
      text: "Type of interview you want",
    },
  ];

  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [startError, setStartError] = useState("");
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [acceptedInstructions, setAcceptedInstructions] = useState(false);

  const handleAnalyzeResume = async () => {
    if (!resumeFile) {
      alert("Please upload a resume first");
      return;
    }

    try {
      setAnalyzing(true);

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const response = await axios.post(
        `${ServerUrl}/api/interview/resume`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Resume Analysis Response:", response.data);

      setRole(response.data.role || "");
      setExperience(response.data.experience || "");
      setProjects(response.data.projects || []);
      setSkills(response.data.skills || []);
      setResumeText(response.data.resumeText || "");

      await setAnalysisDone(true);
      setShowAnalysisModal(true);

    } catch (error) {
      console.error(
        "Resume Analysis Error:",
        error.response?.data || error
      );
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (showAnalysisModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAnalysisModal]);

  // Function to request fullscreen from user gesture
  const requestFullscreen = async () => {
    try {
      if (!document.documentElement.requestFullscreen) {
        throw new Error("Fullscreen API is not supported in this browser.");
      }
      await document.documentElement.requestFullscreen();
      return true;
    } catch (err) {
      console.error("Fullscreen request failed:", err);
      setStartError("Full Screen Mode is required to continue your interview. Please enable Full Screen Mode and try again.");
      return false;
    }
  };

  const handleStart = async () => {
    if (!role.trim() || !experience.trim()) {
      setStartError("Please enter both role and experience before starting the interview.");
      return;
    }

    setStartError("");

    // Request fullscreen FIRST from user gesture
    const fullscreenSuccess = await requestFullscreen();
    if (!fullscreenSuccess) {
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${ServerUrl}/api/interview/generate-questions`,
        {
          role,
          experience,
          mode,
          resumeText,
          projects,
          skills,
        },
        {
          withCredentials: true,
        }
      );

      console.log(result.data);

      if (userData) {
        dispatch(
          setUserData({
            ...userData,
            credits: result.data.creditsLeft,
          })
        );
      }

      if (onStart) {
        onStart(result.data);
      }
    } catch (error) {
      console.error(
        "Interview Generation Error:",
        error.response?.data || error
      );
      setStartError(
        error.response?.data?.message ||
        "Failed to start interview. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="
    min-h-screen
    w-full
    bg-white
    relative
    overflow-hidden
    flex
    items-center
    justify-center
    p-6
  "
    >



      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
        className="

    absolute
    inset-4
    bg-white
    rounded-[36px]
    overflow-hidden
    shadow-2xl
    grid
    grid-cols-1
    lg:grid-cols-3
    z-10
  "
      >

        {/* Left Side */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="
    lg:col-span-1
    bg-black
    p-12
    flex
    flex-col
    justify-center"
        >

          <h1 className="text-5xl font-bold text-white mb-4">
            Start Your AI Interview
          </h1>

          <p className="text-white mb-10 leading-relaxed">
            Practice real interview scenarios powered by AI.
          </p>

          <div className="space-y-4">
            {features.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{
                  scale: 1.03,
                  x: 10,
                }}
                className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md"
              >
                <div className="text-white-600">{item.icon}</div>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side */}
        <div
          className="
    lg:col-span-2
    p-10
    overflow-y-auto
    hide-scrollbar
"
        >
          <h2 className="text-5xl font-bold mb-8">
            Interview Setup
          </h2>

          <div className="space-y-5">
            <div className="space-y-5">

              {/* Role */}
              <div>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. MERN Stack Developer"
                  className="w-full  border border-green-600 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Experience */}
              <div>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. Fresher, 1 Year, 3 Years"
                  className="w-full border border-green-600 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Interview Type */}
              <div>

                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full border border-green-600 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                </select>
              </div>

            </div>

            <motion.label
              whileHover={{
                scale: 1.02,
                borderColor: "#000000",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="border-2 border-dashed border-gray-300 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition-all"
            >
              {resumeFile ? (
                <FileText
                  size={48}
                  className="text-red-500 "
                />
              ) : (
                <Upload
                  size={48}
                  className="text-black"
                />
              )}

              <span className="text-black font-medium text-lg">
                {resumeFile
                  ? resumeFile.name
                  : "Upload Resume"}
              </span>

              <span className="text-gray-500 text-sm mt-2">
                PDF, DOC, DOCX
              </span>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setResumeFile(e.target.files[0]);
                    setShowAnalysisModal(false);
                    setProjects([]);
                    setSkills([]);
                  }
                }}
              />
            </motion.label>

            <AnimatePresence>
              {showAnalysisModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAnalysisModal(false)}
                  className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-xl z-[9999] flex items-center justify-center"                >
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden"
                  >
                    <div className="flex justify-between items-center px-6 py-5 ">
                      <h2 className="text-2xl font-bold">
                        Resume Analysis Result
                      </h2>

                      <button
                        onClick={() => setShowAnalysisModal(false)}
                        className="cursor-pointer w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-xl"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
                      <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-2">
                          Suggested Role
                        </h3>

                        <div className=" border border-green-600 rounded-xl p-4">
                          {role || "Not detected"}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-3">
                          Projects
                        </h3>

                        {projects.length > 0 ? (
                          <ul className="space-y-2">
                            {projects.map((project, index) => (
                              <li
                                key={index}
                                className=" border border-green-600 rounded-xl p-3"
                              >
                                {project}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">
                            No projects detected
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Skills Detected
                        </h3>

                        {skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No skills detected
                          </p>
                        )}
                      </div>
                    </div>

                    <div className=" p-5 flex justify-end">
                      <button
                        onClick={() => {
                          setShowAnalysisModal(false);
                          setAcceptedInstructions(false);
                          setShowInstructionModal(true);
                        }}
                        className=" cursor-pointer bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showInstructionModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowInstructionModal(false)}
                  className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-xl z-[9999] flex items-center justify-center"
                >
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5">
                      <h2 className="text-2xl font-bold">
                        Interview Instructions
                      </h2>

                      <button
                        onClick={() => setShowInstructionModal(false)}
                        className="cursor-pointer w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-xl"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto hide-scrollbar space-y-6">

                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          📖 Read Carefully
                        </h3>

                        <div className="border border-green-600 rounded-xl p-4">
                          Read or listen to each question completely before answering.
                          Make sure you understand the question before responding.
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          ⏱️ Time Limit
                        </h3>

                        <div className="border border-green-600 rounded-xl p-4">
                          Every question has a fixed timer. Submit your answer before
                          the timer expires.
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          💬 Answer Clearly
                        </h3>

                        <div className="border border-green-600 rounded-xl p-4">
                          Keep your answers relevant, concise and structured. Focus on
                          explaining your thought process.
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          💻 Interview Mode
                        </h3>

                        <div className="border border-green-600 rounded-xl p-4">
                          Depending on the interview mode you selected, answer each question either
                          by speaking clearly or by typing your response in the provided answer box.
                          Ensure your responses are complete before submitting.
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          🌐 Internet Connection
                        </h3>

                        <div className="border border-green-600 rounded-xl p-4">
                          Ensure you have a stable internet connection throughout the
                          interview.
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          🚫 Don't Refresh
                        </h3>

                        <div className="border border-green-600 rounded-xl p-4">
                          Do not refresh, close or navigate away from the interview
                          page while the interview is in progress.
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          🧠 Be Yourself
                        </h3>

                        <div className="border border-green-600 rounded-xl p-4">
                          Answer honestly. AI evaluates your communication,
                          confidence and reasoning skills.
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          ✅ One Attempt
                        </h3>

                        <div className="border border-green-600 rounded-xl p-4">
                          Questions appear one at a time. Once submitted, previous
                          answers cannot be changed.
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className="border border-red-700 rounded-xl p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acceptedInstructions}
                            onChange={(e) =>
                              setAcceptedInstructions(e.target.checked)
                            }
                            className="mt-1 h-5 w-5 accent-green-600"
                          />

                          <span className="text-red-500">
                            I have read and understood all the above instructions
                            and I am ready to begin the interview.
                          </span>
                        </label>
                      </div>

                    </div>

                    {/* Footer */}
                    <div className="p-5 flex justify-end gap-3">

                      <button
                        onClick={() => setShowInstructionModal(false)}
                        className="cursor-pointer border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100"
                      >
                        Cancel
                      </button>

                      <button
                        disabled={!acceptedInstructions}
                        onClick={() => {
                          setShowInstructionModal(false);
                        }}
                        className="cursor-pointer bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>

                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4">
              {resumeFile && (
                <motion.button
                  type="button"
                  onClick={handleAnalyzeResume}
                  disabled={analyzing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer flex-1 bg-white border border-black text-black py-4 rounded-2xl font-semibold"
                >
                  {analyzing
                    ? "Analyzing..."
                    : "Analyze Resume"}
                </motion.button>
              )}

              <motion.button
                type="button"
                onClick={handleStart}
                disabled={
                  loading ||
                  !role.trim() ||
                  !experience.trim()
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className=" cursor-pointer flex-1 bg-black text-white py-4 rounded-2xl font-semibold shadow-lg hover:bg-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Starting..."
                  : "Start Interview"}
              </motion.button>
            </div>

            {startError && (
              <p className="text-sm text-red-600 mt-3">
                {startError}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>


  );
}

export default Step1;