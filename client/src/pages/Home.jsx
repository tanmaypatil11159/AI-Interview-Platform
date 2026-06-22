import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import AuthModel from "../components/AuthModel";
import { Sparkles, BriefcaseBusiness, Mic, Clock3 } from "lucide-react";
import Footer from "../components/Footer";
import InfiniteCardGallery from "../components/InfiniteCardGallery";

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardsContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function Home() {
  const [showAuthModel, setShowAuthModel] = useState(false);

  const steps = [
    {
      icon: BriefcaseBusiness,
      step: "STEP 1",
      title: "Role & Experience Selection",
      desc: "AI adjusts difficulty based on selected job role.",
      featured: false,
    },
    {
      icon: Mic,
      step: "STEP 2",
      title: "Smart Voice Interview",
      desc: "Dynamic follow-up questions based on your answers.",
      featured: true,
    },
    {
      icon: Clock3,
      step: "STEP 3",
      title: "Timer Based Simulation",
      desc: "Real interview pressure with time tracking.",
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f8] overflow-hidden">
      <Navbar onLoginClick={() => setShowAuthModel(true)} />

      {showAuthModel && (
        <AuthModel onClose={() => setShowAuthModel(false)} />
      )}

      {/* Hero Section */}
      <motion.section
        className="flex flex-col items-center justify-center px-6 py-20"
        initial="hidden"
        animate="visible"
        variants={heroContainer}
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-full text-sm text-gray-600"
        >
          <motion.span
            animate={{ rotate: [0, 15, -10, 0] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: "easeInOut",
            }}
          >
            <Sparkles size={16} className="text-green-500" />
          </motion.span>
          AI Powered Smart Interview Platform
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          className="text-center text-5xl md:text-7xl font-bold mt-8 leading-tight"
        >
          Practice Interviews with
          <br />
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-green-100 text-green-600 px-6 py-2 rounded-full inline-block mt-2"
          >
            AI Intelligence
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-center text-gray-500 mt-6 max-w-2xl"
        >
          Role-based mock interviews with smart follow-ups,
          adaptive difficulty and real-time performance evaluation.
        </motion.p>

        {/* Buttons */}
        <motion.div variants={fadeUp} className="flex gap-4 mt-10">
          <motion.button
            onClick={() => setShowAuthModel(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="bg-black text-white px-8 py-3 rounded-full"
          >
            Start Interview
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="border border-gray-300 bg-white px-8 py-3 rounded-full"
          >
            View History
          </motion.button>
        </motion.div>

        {/* Steps Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardsContainer}
        >
          {steps.map(({ icon: Icon, step, title, desc, featured }) => (
            <motion.div
              key={step}
              variants={cardVariant}
              whileHover={{
                y: -8,
                boxShadow:
                  "0 20px 40px -10px rgba(0,0,0,0.12), 0 8px 16px -8px rgba(0,0,0,0.08)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative bg-white border rounded-3xl p-8 ${
                featured
                  ? "border-2 border-green-400 shadow-lg md:scale-105"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white border-2 border-green-400 p-3 rounded-xl"
              >
                <Icon className="text-green-500" />
              </motion.div>

              <p className="text-center text-green-500 text-xs font-semibold mt-6">
                {step}
              </p>

              <h3 className="text-center text-xl font-semibold mt-3">
                {title}
              </h3>

              <p className="text-center text-gray-500 mt-3">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <Footer />
    </div>
  );
}

export default Home;