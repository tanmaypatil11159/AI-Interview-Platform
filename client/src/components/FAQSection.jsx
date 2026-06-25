import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does the AI interview work?",
    answer:
      "Our AI interviewer asks role-specific questions, listens to your answers, and generates intelligent follow-up questions just like a real interviewer.",
  },
  {
    question: "Which job roles are supported?",
    answer:
      "You can practice interviews for Software Engineer, Frontend Developer, Backend Developer, Full Stack Developer, Data Analyst, AI/ML Engineer, Product Manager, and many more.",
  },
  {
    question: "Will I receive feedback after the interview?",
    answer:
      "Yes. After completing the interview, you'll receive a detailed report including communication, technical knowledge, confidence, problem-solving, and overall performance.",
  },
  {
    question: "How long does an interview take?",
    answer:
      "Most interviews take between 10–30 minutes depending on the number of questions and the difficulty level you choose.",
  },
  {
    question: "Can I practice multiple times?",
    answer:
      "Absolutely. You can take unlimited mock interviews to improve your skills and track your progress over time.",
  },
  {
    question: "Is my interview history saved?",
    answer:
      "Yes. Every completed interview is stored in your dashboard so you can revisit reports and monitor your improvement.",
  },
];

function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >

          <h2 className="text-4xl md:text-5xl font-bold mt-6">
            Everything you need to know
          </h2>

          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Find answers to the most common questions about AI-powered mock
            interviews and performance reports.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              onMouseEnter={() => setOpen(index)}
              onMouseLeave={() => setOpen(-1)}
              className="border border-gray-200 rounded-2xl overflow-hidden bg-[#fafafa] transition-colors duration-300 hover:bg-white hover:border-green-200"
            >
              <button
                onClick={() => setOpen(open === index ? -1 : index)}
                className="w-full flex justify-between items-center px-6 py-5 text-left"
              >
                <h3 className="font-semibold text-lg">{faq.question}</h3>

                <motion.div
                  animate={{ rotate: open === index ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown size={22} />
                </motion.div>
              </button>

              <AnimatePresence>
                {open === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-gray-600 leading-7">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;