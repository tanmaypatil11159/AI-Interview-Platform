import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

function Step3({ report }) {
  const navigate = useNavigate();
  const isError = report?.error;

  return (
    <div className="min-h-screen bg-[#f5faf8] flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl rounded-2xl md:rounded-3xl bg-white p-5 md:p-8 shadow-lg"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className="rounded-2xl md:rounded-3xl bg-emerald-100 p-3 md:p-4">
            <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Interview Complete</h1>
            <p className="mt-1 md:mt-2 text-gray-600 text-sm md:text-base">
              Your mock interview session finished successfully.
            </p>
          </div>
        </div>

        {isError ? (
          <div className="mt-6 md:mt-8 rounded-2xl md:rounded-3xl bg-red-50 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-red-700">Something went wrong</h2>
            <p className="mt-2 md:mt-3 text-gray-700 text-sm md:text-base">{report.error}</p>
            <button
              onClick={() => navigate("/interview")}
              className="mt-4 md:mt-6 rounded-full bg-black px-4 md:px-6 py-2 md:py-3 text-white text-sm md:text-base"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="mt-6 md:mt-8 grid gap-4 md:gap-6 md:grid-cols-2">
            <div className="rounded-2xl md:rounded-3xl border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-500">Final Score</p>
              <p className="mt-3 md:mt-4 text-3xl md:text-5xl font-bold text-emerald-600">
                {report?.finalScore ?? 0}/10
              </p>
              <p className="mt-3 md:mt-4 text-gray-600 text-sm md:text-base">
                {report?.finalScore >= 7
                  ? "Great job! Your performance was strong."
                  : report?.finalScore >= 4
                  ? "Good effort — review feedback and keep practicing."
                  : "Focus on improving your answers and confidence."
                }
              </p>
            </div>

            <div className="rounded-2xl md:rounded-3xl border border-gray-200 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-500">Skill Averages</p>
              <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
                <div className="flex justify-between text-gray-700 text-sm md:text-base">
                  <span>Confidence</span>
                  <span>{report?.confidence ?? 0}/10</span>
                </div>
                <div className="flex justify-between text-gray-700 text-sm md:text-base">
                  <span>Communication</span>
                  <span>{report?.communication ?? 0}/10</span>
                </div>
                <div className="flex justify-between text-gray-700 text-sm md:text-base">
                  <span>Correctness</span>
                  <span>{report?.correctness ?? 0}/10</span>
                </div>
                <div className="flex justify-between text-gray-700 text-sm md:text-base">
                  <span>Technical</span>
                  <span>{report?.technical ?? 0}/10</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 rounded-2xl md:rounded-3xl border border-gray-200 bg-gray-50 p-4 md:p-6">
              <p className="text-xs md:text-sm text-gray-500">Next Steps</p>
              <div className="mt-3 md:mt-4 grid gap-3 md:gap-4 sm:grid-cols-2">
                <button
                  onClick={() => navigate(`/report/${report?.interviewId}`)}
                  className="rounded-2xl md:rounded-3xl bg-black px-4 md:px-6 py-3 md:py-4 text-white text-sm md:text-base"
                >
                  View Full Report
                </button>
                <button
                  onClick={() => navigate("/history")}
                  className="rounded-2xl md:rounded-3xl border border-black bg-white px-4 md:px-6 py-3 md:py-4 text-black text-sm md:text-base"
                >
                  View Interview History
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Step3;
