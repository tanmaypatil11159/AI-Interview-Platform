import { useState } from "react";
import { motion, useMotionValue, useAnimationFrame, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";
import AuthModel from "../components/AuthModel";
import { Sparkles, BriefcaseBusiness, Mic, Clock3 } from "lucide-react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import FAQSection from "../components/FAQsection";
import { TypeAnimation } from "react-type-animation";
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
  const navigate = useNavigate()

  // Moving Bar Logic
  const [speed, setSpeed] = useState(1); // 1 is base speed
  const x = useMotionValue(0);

  useAnimationFrame((t, delta) => {
    // Smoothly increment the x value based on speed and time delta
    // Base speed factor of 0.015 for a nice slow movement
    const moveBy = (delta * 0.015 * speed);
    let nextX = x.get() - moveBy;

    // Loop back when we reach -50% (since we have two identical sets of content)
    if (nextX <= -50) {
      nextX = 0;
    }
    x.set(nextX);
  });

  const xPos = useTransform(x, (v) => `${v}%`);

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

        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          className="text-center pt-7 text-5xl md:text-8xl font-bold mt-8 leading-tight"
        >
          Practice Interviews with
          <br />

          <span className=" mt-4">
            <TypeAnimation
              sequence={[
                "AI Intelligence",
                2000,
                "AI Recruiter",
                2000,
                "AI Interviewer",
                2000,
                "AI Career Coach",
                2000,
              ]}
              wrapper="span"
              speed={35}
              repeat={Infinity}
              className="text-black-600 px-6 py-2 rounded-full inline-block"
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-center text-gray-500 text-2xl mt-6 max-w-2xl"
        >
          Role-based mock interviews with smart follow-ups,
          adaptive difficulty and real-time performance evaluation.
        </motion.p>

        {/* Buttons */}
        <motion.div variants={fadeUp} className="flex gap-4 mt-10">
          <motion.button
            onClick={() => navigate("/interview")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="bg-black text-white px-8 py-3 rounded-full"
          >
            Start Interview
          </motion.button>

          <motion.button
            onClick={() => navigate("/history")}
            whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="border border-gray-300 bg-white px-8 py-3 rounded-full"
          >
            View History
          </motion.button>
        </motion.div>

        {/* Moving Bar */}
        <div className="w-full bg-white border-y border-gray-200 py-6 mt-16 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

          <motion.div
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              ease: "linear",
              duration: 25,
              repeat: Infinity,
            }}
            className="flex w-max"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex shrink-0 items-center gap-12 px-6">
                <span className="text-8xl font-bold text-gray-300">
                  REAL-TIME EVALUATION #
                </span>

                <span className="text-8xl font-bold text-gray-300">
                  AI-POWERED FEEDBACK #
                </span>

                <span className="text-8xl font-bold text-gray-300">
                  MOCK INTERVIEWS #
                </span>

                <span className="text-8xl font-bold text-gray-300">
                  ADAPTIVE DIFFICULTY #
                </span>

                <span className="text-8xl font-bold text-gray-300">
                  SMART VOICE ANALYSIS #
                </span>
              </div>
            ))}
          </motion.div>
        </div>


        {/* Steps Cards */}
        <motion.div
          className="grid lg:grid-cols-3 gap-8 mt-24 max-w-7xl w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardsContainer}
        >
          {steps.map(({ icon: Icon, step, title, desc, featured }, index) => (
            <motion.div
              key={step}
              variants={cardVariant}
              whileHover={{
                y: -12,
                scale: 1.03,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              className={`relative overflow-hidden rounded-3xl border backdrop-blur-xl bg-white/80 p-8 group border-gray-200 hover:border-green-300}`}
            >
              {/* Background Glow */}
              <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-green-200/30 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

              {/* Step Number */}
              <span className="absolute top-5 right-6 text-6xl font-black text-gray-100 select-none">
                0{index + 1}
              </span>

              {/* Icon */}
              <motion.div
                whileHover={{
                  rotate: 8,
                  scale: 1.12,
                }}
                transition={{ type: "spring", stiffness: 250 }}
                className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-300/40"
              >
                <Icon size={30} className="text-white" />
              </motion.div>

              {/* Step */}
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-green-600">
                {step}
              </p>

              {/* Title */}
              <h3 className="mt-3 text-2xl font-bold text-gray-900 leading-snug">
                {title}
              </h3>

              {/* Description */}
              <p className="mt-4 text-gray-500 leading-7">
                {desc}
              </p>

              {/* Bottom Line */}
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.4 }}
                className="mt-8 h-1 rounded-full bg-gradient-to-r from-green-500 via-emerald-400 to-lime-300"
              />




            </motion.div>
          ))}
        </motion.div>
      </motion.section>
      <FAQSection />

      <Footer />
    </div>
  );
}

export default Home;