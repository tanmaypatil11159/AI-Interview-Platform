import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

function Step3({ report }) {
  const navigate = useNavigate();
  const isError = report?.error;

  return (
    <div className="min-h-screen bg-[#f5faf8] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl rounded-3xl bg-white p-8 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-3xl bg-emerald-100 p-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interview Complete</h1>
            <p className="mt-2 text-gray-600">
              Your mock interview session finished successfully.
            </p>
          </div>
        </div>

        {isError ? (
          <div className="mt-8 rounded-3xl bg-red-50 p-6">
            <h2 className="text-xl font-semibold text-red-700">Something went wrong</h2>
            <p className="mt-3 text-gray-700">{report.error}</p>
            <button
              onClick={() => navigate("/interview")}
              className="mt-6 rounded-full bg-black px-6 py-3 text-white"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500">Final Score</p>
              <p className="mt-4 text-5xl font-bold text-emerald-600">
                {report?.finalScore ?? 0}/10
              </p>
              <p className="mt-4 text-gray-600">
                {report?.finalScore >= 7
                  ? "Great job! Your performance was strong."
                  : report?.finalScore >= 4
                  ? "Good effort — review feedback and keep practicing."
                  : "Focus on improving your answers and confidence."
                }
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500">Skill Averages</p>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Confidence</span>
                  <span>{report?.confidence ?? 0}/10</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Communication</span>
                  <span>{report?.communication ?? 0}/10</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Correctness</span>
                  <span>{report?.correctness ?? 0}/10</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 rounded-3xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-sm text-gray-500">Next Steps</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => navigate(`/report/${report?.interviewId}`)}
                  className="rounded-3xl bg-black px-6 py-4 text-white"
                >
                  View Full Report
                </button>
                <button
                  onClick={() => navigate("/history")}
                  className="rounded-3xl border border-black bg-white px-6 py-4 text-black"
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
