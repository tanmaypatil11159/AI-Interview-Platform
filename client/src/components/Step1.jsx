import React, { useState } from "react";
import { motion } from "framer-motion";
import { ServerUrl } from "../utils/constants";
import {
  UserRound,
  Mic,
  BarChart3,
  Briefcase,
  Upload,
} from "lucide-react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice"; // adjust path

function Step1({ onStart }) {
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
    } catch (error) {
      console.error(
        "Resume Analysis Error:",
        error.response?.data || error
      );
    } finally {
      setAnalyzing(false);
    }
  };

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
      className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10 relative overflow-hidden"
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
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 relative z-10"
      >
        {/* Left Side */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-10 flex flex-col justify-center"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Start Your AI Interview
          </h1>

          <p className="text-gray-600 mb-10 leading-relaxed">
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
                <div className="text-green-600">{item.icon}</div>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side */}
        <div className="p-10">
          <h2 className="text-3xl font-bold mb-8">
            Interview Setup
          </h2>

          <div className="space-y-5">
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Enter role"
              className="w-full border rounded-lg py-3 px-4"
            />

            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Experience"
              className="w-full border rounded-lg py-3 px-4"
            />

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border rounded-lg py-3 px-4"
            >
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Behavioral">Behavioral</option>
              <option value="System Design">System Design</option>
            </select>

            <label className="border-2 border-dashed border-green-400 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer">
              <Upload size={40} />

              <span>
                {resumeFile
                  ? resumeFile.name
                  : "Upload Resume"}
              </span>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setResumeFile(e.target.files[0]);
                    setAnalysisDone(false);
                  }
                }}
              />
            </label>

            {analysisDone && (
              <div className="rounded-lg border bg-gray-50 p-5">
                <h2 className="text-xl font-semibold mb-4">
                  Resume Analysis Result
                </h2>

                <div className="mb-4">
                  <h3 className="font-semibold">Role</h3>
                  <p>{role}</p>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold">Projects</h3>
                  <ul className="list-disc ml-5">
                    {projects.map((project, index) => (
                      <li key={index}>{project}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Skills
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {resumeFile && (
              <button
                type="button"
                onClick={handleAnalyzeResume}
                disabled={analyzing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg"
              >
                {analyzing
                  ? "Analyzing Resume..."
                  : "Analyze Resume"}
              </button>
            )}

            <button
              type="button"
              onClick={handleStart}
              disabled={loading || !role.trim() || !experience.trim()}
              className="w-full bg-green-600 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? "Starting..." : "Start Interview"}
            </button>

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