import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserRound,
  Mic,
  BarChart3,
  Briefcase,
  Upload,
} from "lucide-react";
import axios from "axios";

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

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");

  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Replace with your backend URL
  const Serverurl = "http://localhost:8000";

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
        `${Serverurl}/api/interview/resume`,
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
      console.error("Resume Analysis Error:", error);
    } finally {
      setAnalyzing(false);
    }

  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10 relative overflow-hidden"
    >
      {/* Background Blurs */}
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

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 relative z-10"
      >
        {/* Left Section */}
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
            Improve communication, technical skills, and confidence.
          </p>

          <div className="space-y-4">
            {features.map((item, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  x: -40,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.4 + index * 0.2,
                }}
                whileHover={{
                  scale: 1.03,
                  x: 10,
                }}
                className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md cursor-pointer"
              >
                <div className="text-green-600">{item.icon}</div>

                <span className="text-gray-700 font-medium">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
          }}
          className="p-10"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Interview Setup
          </h2>

          <form className="space-y-5">
            {/* Role */}
            <div className="relative">
              <Briefcase
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Enter role"
                className="w-full border border-gray-200 rounded-lg py-3 pl-12 pr-4 outline-none focus:border-green-500 transition-all"
              />
            </div>

            {/* Experience */}
            <div className="relative">
              <Briefcase
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Experience (e.g. 2 years)"
                className="w-full border border-gray-200 rounded-lg py-3 pl-12 pr-4 outline-none focus:border-green-500 transition-all"
              />
            </div>

            {/* Interview Type */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border border-gray-200 rounded-lg py-3 px-4 outline-none focus:border-green-500"
            >
              <option value="Technical">
                Technical Interview
              </option>
              <option value="HR">
                HR Interview
              </option>
              <option value="Behavioral">
                Behavioral Interview
              </option>
              <option value="System Design">
                System Design Interview
              </option>
            </select>

            {/* Resume Upload */}
            <motion.label
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="border-2 border-dashed border-green-400 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer bg-green-50 hover:bg-green-100 transition-all"
            >
              <Upload
                size={40}
                className="text-green-600 mb-3"
              />

              <span className="font-medium text-gray-700">
                {resumeFile
                  ? resumeFile.name
                  : "Upload Resume"}
              </span>

              <span className="text-sm text-gray-500 mt-1">
                PDF, DOC, DOCX
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
            </motion.label>

            {
              analysisDone && (
                <div className="mt-6 rounded-lg border bg-gray-50 p-5">
                  <h2 className="text-xl font-semibold mb-4">
                    Resume Analysis Result
                  </h2>

                  {/* Role */}
                  <div className="mb-5">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Role:
                    </h3>

                    <p className="text-gray-600">{role}</p>
                  </div>

                  {/* Projects */}
                  <div className="mb-5">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Projects:
                    </h3>

                    <ul className="list-disc ml-6 space-y-1">
                      {projects?.map((project, index) => (
                        <li key={index}>{project}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Skills:
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {skills?.map((skill, index) => (
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
              )
            }

            {/* Analyze Resume Button */}
            {resumeFile && (
              <motion.button
                type="button"
                onClick={handleAnalyzeResume}
                whileHover={{
                  scale: 1.03,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                disabled={analyzing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {analyzing
                  ? "Analyzing Resume..."
                  : "Analyze Resume"}
              </motion.button>
            )}

            {/* Start Interview Button */}
            {analysisDone && (
              <motion.button
                type="button"
                onClick={onStart}
                whileHover={{
                  scale: 1.03,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-green-700"
              >
                Start Interview
              </motion.button>
            )}
          </form>
        </motion.div>
      </motion.div>
    </motion.div>

  );
}

export default Step1;