import React from "react";
import { motion } from "framer-motion";
import { UserRound,Mic,BarChart3,Briefcase,Upload } from "lucide-react";
import { useState } from 'react';
import axios from 'axios';

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
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const handleUploadResume = async () => {
        if(!resumeFile || analyzing) return;
        setAnalyzing(true);
        formdata.append("resume",resumeFile)
        
        try {
            const result = await axios.post(Serverurl + "/api/interview/resume",formdata,{withCredentials: true})

            console.log(result.data);

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setAnalysisDone(true);

            setAnalyzing(false);
            
        } catch(error) {
            console.log(error)
            setAnalyzing(false);
        }

    }

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
            Improve communication, technical skills, and
            confidence.
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
                <div className="text-green-600">
                  {item.icon}
                </div>

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
            Interview SetUp
          </h2>

          <form className="space-y-5">
            {/* Role */}
            <div className="relative">
              <Briefcase
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <motion.input
                whileFocus={{
                  scale: 1.02,
                }}
                type="text"
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

              <motion.input
                whileFocus={{
                  scale: 1.02,
                }}
                type="text"
                placeholder="Experience (e.g. 2 years)"
                className="w-full border border-gray-200 rounded-lg py-3 pl-12 pr-4 outline-none focus:border-green-500 transition-all"
              />
            </div>

            {/* Interview Type */}
            <motion.select
              whileFocus={{
                scale: 1.02,
              }}
              className="w-full border border-gray-200 rounded-lg py-3 px-4 outline-none focus:border-green-500"
            >
              <option>Technical Interview</option>
              <option>HR Interview</option>
              <option>Behavioral Interview</option>
              <option>System Design Interview</option>
            </motion.select>

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
                Upload Resume
              </span>

              <span className="text-sm text-gray-500 mt-1">
                PDF, DOC, DOCX
              </span>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
            </motion.label>

            {/* Start Button */}
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
              onClick={(e)=>{e.stopPropagation();handleUploadResume()}}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-green-700 transition-all"
            >
              Start Interview
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Step1;