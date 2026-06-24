
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
      text: "Choose Role & Experience",
    },
    {
      icon: <Mic size={18} />,
      text: "Smart Voice Interview",
    },
    {
      icon: <BarChart3 size={18} />,
      text: "Performance Analytics",
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

      setAnalysisDone(true);
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

  const handleStart = async () => {
    if (!role.trim() || !experience.trim()) {
      setStartError("Please enter both role and experience before starting the interview.");
      return;
    }

    setStartError("");

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
  className="h-screen w-screen bg-black relative overflow-hidden"
>
  <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-72 h-72 bg-green-300/20 blur-3xl rounded-full top-10 left-10"
      />

      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-72 h-72 bg-blue-300/20 blur-3xl rounded-full bottom-10 right-10"
      />

<motion.div
  initial={{ opacity: 0, y: 50, scale: 1 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
    duration: 0.8,
    ease: "easeOut",
  }}
  className="w-screen h-screen bg-white overflow-hidden grid md:grid-cols-2 relative z-10"
>
  
        {/* Left Side */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="bg-black p-10 flex flex-col justify-center"
        >

          <h1 className="text-4xl font-bold text-white mb-4">
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
        <div className="p-10 rounded-tl-[50px] rounded-bl-[50px]">

          <h2 className="text-4xl font-bold mb-8">
            Interview Setup
          </h2>

          <div className="space-y-5">
           <div className="space-y-5">

  {/* Role */}
  <div>
    <label className="block text-sm font-semibold text-black mb-2">
      Role
    </label>

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
    <label className="block text-sm font-semibold text-black mb-2">
      Experience
    </label>

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
    <label className="block text-sm font-semibold text-black mb-2">
      Interview Type
    </label>

    <select
      value={mode}
      onChange={(e) => setMode(e.target.value)}
      className="w-full border border-green-600 rounded-xl py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black"
    >
      <option value="Technical">Technical</option>
      <option value="HR">HR</option>
      <option value="Behavioral">Behavioral</option>
      <option value="System Design">System Design</option>
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
                        onClick={() => setShowAnalysisModal(false)}
                        className=" cursor-pointer bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800"
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