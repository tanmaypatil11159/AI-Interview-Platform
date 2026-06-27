import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ServerUrl } from "../utils/constants";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(`${ServerUrl}/api/interview/report/${id}`, {
          withCredentials: true,
        });
        console.log(result.data)
        setReport(result.data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      }
    };

    fetchReport();
  }, [id]);
  
  const downloadPDF = async () => {
    
      const elements = reportRef.current.querySelectorAll("*");
    
    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
    
      if (style.backgroundColor.includes("oklch")) {
        el.style.backgroundColor = "#ffffff";
      }
    
      if (style.color.includes("oklch")) {
        el.style.color = "#111827";
      }
    
      if (style.borderColor.includes("oklch")) {
        el.style.borderColor = "#e5e7eb";
      }
    });
    if (!reportRef.current) return;

    try {
const canvas = await html2canvas(reportRef.current, {
  scale: 2,
  useCORS: true,
  allowTaint: true,
  backgroundColor: "#ffffff",
  scrollX: 0,
  scrollY: 0,
  windowWidth: document.documentElement.scrollWidth,
  windowHeight: document.documentElement.scrollHeight,
});

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("Interview_Report.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  const trendData =
    report?.questionWiseScore?.map((q, index) => ({
      name: `Q${index + 1}`,
      score: q.score,
    })) || [];

  const skillData = [
    { skill: "Confidence", value: report?.confidence || 0 },
    { skill: "Communication", value: report?.communication || 0 },
    { skill: "Correctness", value: report?.correctness || 0 },
    { skill: "Technical", value: report?.technical || 0 },
  ];

  
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5faf8] p-6">
        <div className="rounded-3xl bg-white p-10 shadow-lg text-center">
          <p className="text-lg font-semibold text-gray-700">Loading Report...</p>
        </div>
      </div>
    );
  }

  const finalScore = report.finalScore || 0;
  const averageScore = report.averageScore ?? finalScore;
  const questionCount = report.questionWiseScore?.length || 0;

  return (
    <div className="min-h-screen bg-[#f5faf8] p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-white"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Interview Report</h1>
            <p className="mt-2 text-gray-500">Review your interview analytics and download a summary.</p>
          </div>

          <button
            onClick={downloadPDF}
            className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white shadow-lg  transition hover:bg-emerald-700"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>

        <div
  ref={reportRef}
  className="space-y-6 bg-white p-6"
>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700">Final Score</h2>
                <div className="mt-8 flex items-center justify-center">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-8 border-emerald-500 bg-emerald-50">
                    <span className="text-4xl font-bold text-emerald-700">{finalScore}/10</span>
                  </div>
                </div>
                <p className="mt-6 text-center text-gray-500">
                  {finalScore >= 7
                    ? "Excellent performance"
                    : finalScore >= 4
                    ? "Good improvement potential"
                    : "Significant improvement required"}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700">Interview Mode</h2>
                <div className="mt-8 flex items-center justify-center">
<span className="text-3xl font-bold text-emerald-700 capitalize">
  {report.mode === "HR" ? "Human Resources (HR)" : "Technical"}
</span>                  
                </div>
                
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700">Skill Summary</h2>
                <div className="mt-6 space-y-4">
                  {skillData.map((item) => (
                    <div key={item.skill}>
                      <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                        <span>{item.skill}</span>
                        <span>{item.value}/10</span>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(item.value, 10) * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700">Interview Stats</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Total Questions</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900">{questionCount}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Average Score</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900">{averageScore.toFixed(1)} / 10</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700">Performance Trend</h2>
                <div className="mt-6 h-80">
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="score" stroke="#22c55e" fill="url(#scoreGradient)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">No trend data available.</div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700">Question Breakdown</h2>
                <div className="mt-6 space-y-6">
                  {report.questionWiseScore?.length > 0 ? (
                    report.questionWiseScore.map((q, index) => (
                      <div key={index} className="rounded-3xl border border-gray-200 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-base font-semibold text-gray-800">Question {index + 1}</h3>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{q.score}/10</span>
                        </div>
                        <p className="mt-4 text-gray-700">{q.question}</p>
                        <div className="mt-5 grid gap-4 lg:grid-cols-2">
                          <div className="rounded-3xl bg-blue-50 p-4">
                            <h4 className="text-sm font-semibold text-blue-700">Your Answer</h4>
                            <p className="mt-2 text-gray-700">{q.answer || "No answer provided."}</p>
                          </div>
                          <div className="rounded-3xl bg-green-50 p-4">
                            <h4 className="text-sm font-semibold text-green-700">AI Feedback</h4>
                            <p className="mt-2 text-gray-700">{q.feedback || "No feedback available."}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No question breakdown available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewReport;
