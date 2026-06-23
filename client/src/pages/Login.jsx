import { FaRobot } from "react-icons/fa";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { auth, provider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { ServerUrl } from "../utils/constants.js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";


function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      let firebaseUser = response.user;
      let name = firebaseUser.displayName;
      let email = firebaseUser.email;

      const result = await axios.post(ServerUrl + "/api/auth/google", {
        name,
        email,
      }, {
        withCredentials: true,
      });

      dispatch(setUserData(result.data));
      
      if (result.status === 200) {
        console.log("Login successful:", result.data);
        navigate("/");
      }
    } catch (error) {
      console.error("Google authentication failed:", error);
      dispatch(setUserData(null));
    }
  }


  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white border border-gray-200 w-full max-w-md rounded-3xl shadow-xl p-8 text-center"
      >

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-3 mb-8"
        >
          
          <motion.div
            className="bg-black p-3 rounded-xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 15,
              delay: 0.2,
            }}
          >
            <FaRobot className="text-white text-xl" />
          </motion.div>

          <motion.h2
            className="font-semibold text-lg text-gray-800"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            InterviewIQ.AI
          </motion.h2>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold text-gray-900 mb-6"
        >
          Continue with
        </motion.h1>

        <motion.button
          variants={itemVariants}
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 15px 35px rgba(34,197,94,0.25)",
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="inline-flex items-center gap-2 bg-green-100 text-green-700 font-semibold text-2xl px-6 py-3 rounded-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Sparkles size={24} />
          </motion.div>

          AI Smart Interview
        </motion.button>
        <motion.p
          variants={itemVariants}
          className="mt-6 text-gray-500 text-sm leading-relaxed"
        >
          Sign in to start AI-powered mock interviews, track your
          progress, and unlock detailed performance insights.
        </motion.p>

        <motion.button
          onClick={handleGoogleAuth}
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.03,
            boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
          }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 w-full flex items-center justify-center gap-3 bg-black text-white py-3 px-6 rounded-full overflow-hidden relative"
        >


          <motion.div
            animate={{
              x: ["-150%", "250%"],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-0 left-0 h-full w-16  skew-x-12"
          />

          <FcGoogle className="text-2xl relative z-10" />

          <span className="relative z-10 font-medium">
            Continue with Google
          </span>
        </motion.button>

      </motion.div>
    </div>
  );
}

export default Login;