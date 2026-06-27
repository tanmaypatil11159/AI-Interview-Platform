import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthModel from "../components/AuthModel";
import Footer from "../components/Footer";

function Pricing() {
  const [showAuthModel, setShowAuthModel] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "₹0",
      credits: "100 Credits",
      badge: "Default",
      description:
        "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      button: "Get Started",
      popular: false,
    },
    {
      name: "Starter Pack",
      price: "₹100",
      credits: "150 Credits",
      description:
        "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
      button: "Buy Now",
      popular: false,
    },
    {
      name: "Pro Pack",
      price: "₹500",
      credits: "650 Credits",
      badge: "Best Value",
      description:
        "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      button: "Buy Now",
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5faf8]">
      <Navbar onLoginClick={() => setShowAuthModel(true)} />
      {showAuthModel && (
        <AuthModel onClose={() => setShowAuthModel(false)} />
      )}

      <main className="mx-auto max-w-7xl px-6 py-16">
        <button
          onClick={() => navigate(-1)}
          className="mb-10 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900">
            Choose Your Plan
          </h1>

          <p className="mt-4 text-lg text-gray-500">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[30px] border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.popular
                  ? "border-emerald-500 shadow-lg scale-[1.03]"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute right-6 top-6 rounded-full px-3 py-1 text-xs font-semibold ${
                    plan.popular
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <h2 className="text-2xl font-semibold text-gray-900">
                {plan.name}
              </h2>

              <p className="mt-5 text-5xl font-bold text-emerald-600">
                {plan.price}
              </p>

              <p className="mt-2 text-gray-500">{plan.credits}</p>

              <p className="mt-6 text-sm leading-7 text-gray-500">
                {plan.description}
              </p>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                      <Check size={12} className="text-white" />
                    </div>

                    <span className="text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className={`mt-10 w-full rounded-2xl py-4 text-lg font-semibold transition ${
                  plan.name === "Free"
                    ? "border border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Credit Usage
          </h3>

          <p className="mt-3 text-gray-600">
            Every complete AI interview consumes{" "}
            <span className="font-semibold text-emerald-600">
              50 credits
            </span>
            . Credits include AI-generated questions, answer evaluation,
            voice interview, and a detailed performance report.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Pricing;

