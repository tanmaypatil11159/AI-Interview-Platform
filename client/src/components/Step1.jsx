import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaCrown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../utils/constants';

const Step1 = ({ onStart }) => {
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [mode, setMode] = useState('Technical');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUser, setIsUser] = useState(null);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${ServerUrl}/api/user/me`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setIsUser(res.data.user);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error(err);
        navigate('/');
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobRole || !jobDescription || !jobExperience) {
      alert('Please fill all the fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post(
        `${ServerUrl}/api/interview/generate-questions`,
        {
          role: jobRole,
          jobDescription,
          experience: jobExperience,
          mode
        },
        {
          withCredentials: true
        }
      );

      if (res.data.success && res.data.creditsLeft > 0) {
        onStart(res.data);
      } else if (res.data.success && res.data.creditsLeft <= 0) {
        setShowCreditsModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUser === null) {
    return (
      <div className="min-h-screen bg-[#E8F5FD] flex items-center justify-center p-4">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#E8F5FD] p-4"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">

        {/* LEFT SIDE */}
        <div className="flex-1 flex flex-col justify-center gap-8 w-full">
          <div className="flex flex-col gap-3">
            <motion.p
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-emerald-600 font-semibold flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full inline-block" />
              Welcome back, {isUser.name}!
            </motion.p>

            <motion.h1
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800"
            >
              Let's prepare for your
              <br />
              <span className="text-emerald-600">
                Dream Interview
              </span>
            </motion.h1>

            <motion.p
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-500 text-base md:text-lg lg:text-xl"
            >
              Practice with our AI-powered interview prep tool and boost your chances of landing the job.
            </motion.p>
          </div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-3 border border-gray-300 bg-white p-4 rounded-2xl shadow-sm max-w-xl"
          >
            <div className="flex items-center gap-2 text-gray-800 font-semibold text-base md:text-lg">
              <FaCrown size={18} className="text-emerald-600" />
              Credits Left: <span className="text-emerald-600 text-xl md:text-2xl">{isUser.credits}</span>
            </div>

            <p className="text-gray-500 text-sm">
              You need at least 1 credit to start an interview.
            </p>
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex-1 bg-white rounded-3xl shadow-sm w-full"
        >
          <div className="p-5 md:p-6 lg:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
              Job Details
            </h2>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 md:gap-5"
            >
              <div className="flex flex-col gap-1 md:gap-2">
                <label className="text-sm md:text-base font-semibold text-gray-700">
                  Job Role
                </label>
                <input
                  required
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  type="text"
                  className="w-full border border-gray-300 bg-gray-50 p-3 md:p-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g., Frontend Developer, Product Manager"
                />
              </div>

              <div className="flex flex-col gap-1 md:gap-2">
                <label className="text-sm md:text-base font-semibold text-gray-700">
                  Job Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full border border-gray-300 bg-gray-50 p-3 md:p-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Paste the job description here..."
                />
              </div>

              <div className="flex flex-col gap-1 md:gap-2">
                <label className="text-sm md:text-base font-semibold text-gray-700">
                  Years of Experience
                </label>
                <select
                  value={jobExperience}
                  onChange={(e) => setJobExperience(e.target.value)}
                  className="w-full border border-gray-300 bg-gray-50 p-3 md:p-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select your experience</option>
                  <option value="0">Fresher</option>
                  <option value="1">1 Year</option>
                  <option value="2">2 Years</option>
                  <option value="3">3 Years</option>
                  <option value="4">4 Years</option>
                  <option value="5">5+ Years</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 md:gap-2">
                <label className="text-sm md:text-base font-semibold text-gray-700">
                  Interview Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Technical", "HR"].map((item) => (
                    <div key={item}>
                      <input
                        type="radio"
                        id={item}
                        name="mode"
                        value={item}
                        checked={mode === item}
                        onChange={() => setMode(item)}
                        className="hidden peer"
                      />
                      <label
                        htmlFor={item}
                        className="block p-3 md:p-4 text-sm md:text-base text-center font-semibold bg-gray-50 border border-gray-200 rounded-xl cursor-pointer transition-all duration-300 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600"
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full p-3 md:p-4 text-base md:text-lg flex items-center justify-center gap-2 text-white bg-black hover:bg-gray-800 rounded-xl font-semibold"
              >
                {isSubmitting ? "Generating..." : "Start Interview"}
                <FaArrowRight />
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCreditsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-sm w-full mx-4"
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                Credits Exhausted
              </h3>

              <p className="text-gray-500 mb-6 text-sm md:text-base">
                Oops! You don't have enough credits to start a new interview.
              </p>

              <button
                onClick={() => setShowCreditsModal(false)}
                className="w-full p-3 md:p-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                Buy More Credits
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Step1;