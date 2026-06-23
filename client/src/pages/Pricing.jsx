import { useState } from "react";
import Navbar from "../components/Navbar";
import AuthModel from "../components/AuthModel";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function Pricing() {
  const [showAuthModel, setShowAuthModel] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f8f8] overflow-hidden">
      <Navbar onLoginClick={() => setShowAuthModel(true)} />
      {showAuthModel && <AuthModel onClose={() => setShowAuthModel(false)} />}

      <main className="px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-gray-200 bg-white p-10 shadow-sm">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Pricing
              </p>
              <h1 className="mt-4 text-5xl font-bold text-gray-900">
                Choose the best plan for your interview prep.
              </h1>
              <p className="mt-4 max-w-2xl text-gray-600">
                InterviewIQ.AI helps you prepare with AI-powered mock interviews,
                personalized feedback, and progress tracking.
              </p>
            </div>

            <div className="rounded-[2rem] border border-gray-200 bg-[#f5faf8] p-8 shadow-sm">
              <p className="text-sm text-gray-500">Popular</p>
              <h2 className="mt-4 text-4xl font-bold text-gray-900">Pro Plan</h2>
              <p className="mt-2 text-gray-600">Everything you need to practice smarter and faster.</p>
              <div className="mt-8 space-y-4">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">AI interview sessions</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">Unlimited</p>
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Detailed score reports</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">Included</p>
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Community interview resources</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">Included</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/interview")}
                className="mt-8 w-full rounded-full bg-black px-6 py-4 text-white transition hover:bg-gray-900"
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Pricing;
