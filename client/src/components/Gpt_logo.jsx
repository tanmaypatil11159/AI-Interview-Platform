import { motion } from "framer-motion";

export default function Gpt_logo() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "linear",
      }}
      className="w-32 h-32"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M50 10
             C70 10 85 25 85 45
             C85 65 70 80 50 80
             C30 80 15 65 15 45
             C15 25 30 10 50 10Z"
          stroke="white"
          strokeWidth="6"
        />

        <path
          d="M50 20
             L70 32
             L70 56
             L50 68
             L30 56
             L30 32
             Z"
          stroke="white"
          strokeWidth="6"
        />
      </svg>
    </motion.div>
  );
}