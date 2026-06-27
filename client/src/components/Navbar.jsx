import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { BsCoin } from "react-icons/bs";
import { FaRobot, FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { setUserData } from "../redux/userSlice";
import { ServerUrl } from "../utils/constants";

function Navbar({ onLoginClick }) {
  const { userData } = useSelector((state) => state.user);

  const [showCreditsPopup, setShowCreditsPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const creditsRef = useRef(null);
  const userRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${ServerUrl}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("token");
      dispatch(setUserData(null));

      setShowCreditsPopup(false);
      setShowUserPopup(false);

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        creditsRef.current &&
        !creditsRef.current.contains(event.target)
      ) {
        setShowCreditsPopup(false);
      }

      if (
        userRef.current &&
        !userRef.current.contains(event.target)
      ) {
        setShowUserPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
<div className="fixed top-0 left-0 right-0 z-50 py-4 flex justify-center">
   <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
className="w-full max-w-6xl rounded-[24px] backdrop-blur-md border border-gray-300 px-8 py-4 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.08)]"      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <FaRobot className="text-white text-lg" />
          </div>

          <h1 className="text-xl font-semibold text-gray-800">
            InterviewIQ.AI
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Credits */}
          <div ref={creditsRef} className="relative">
            <button
              onClick={() => {
                setShowCreditsPopup((prev) => !prev);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition"
            >
              <BsCoin size={20} className="text-yellow-500" />
              {userData?.credits || 0}
            </button>

            <AnimatePresence>
              {showCreditsPopup && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10"
                >
                  <p className="text-sm text-gray-700">
                    You have{" "}
                    <span className="text-red-500 font-semibold">
                      {userData?.credits || 0}
                    </span>{" "}
                    credits available.
                  </p>

                  <p className="text-sm text-gray-700 mt-1">
                    Need more credits? Buy them now!
                  </p>

                  <motion.button
                    onClick={() => {
                      setShowCreditsPopup(false);
                      navigate("/pricing");
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                    className="mt-3 w-full bg-black text-white py-2 rounded-full hover:bg-gray-800"
                  >
                    Buy Credits
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div ref={userRef} className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  onLoginClick();
                  return;
                }

                setShowUserPopup((prev) => !prev);
                setShowCreditsPopup(false);
              }}
              className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold"
            >
              {userData?.name ? (
                userData.name.charAt(0).toUpperCase()
              ) : (
                <FaUserAstronaut size={16} />
              )}
            </button>

            <AnimatePresence>
              {showUserPopup && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10"
                >
                  {/* User Info */}
                  <div className="pb-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">
                      {userData?.name || "User"}
                    </p>

                    <p className="text-sm text-gray-500">
                      Credits:{" "}
                      <span className="text-red-500 font-semibold">
                        {userData?.credits || 0}
                      </span>
                    </p>
                  </div>

                  {/* Menu */}
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setShowUserPopup(false);
                        navigate("/history");
                      }}
                      className="w-full bg-black text-white py-2 rounded-full hover:bg-gray-800 transition"
                    >
                      History
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-500 text-white py-2 rounded-full hover:bg-red-600 transition"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Navbar;