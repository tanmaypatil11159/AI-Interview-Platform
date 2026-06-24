import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pointer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ServerUrl } from "../utils/constants";

function InterviewHistory() {
    const [interviews, setInterviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                const result = await axios.get(
                    `${ServerUrl}/api/interview/get-interview`,
                    {
                        withCredentials: true,
                    }
                );
                console.log(result.data)
                setInterviews(result.data);
            } catch (e) {
                console.log(e);
            }
        };

        getMyInterviews();
    }, []);

    return (
        <div className="min-h-screen bg-[#f5faf8] px-6 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black"
                >
                    <ArrowLeft size={20} />
                </button>

                <h1 className="text-4xl font-bold text-gray-800">
                    Interview History
                </h1>

                <p className="text-gray-500 mt-2">
                    Track your past interviews and performance reports
                </p>
            </motion.div>

            {/* Cards */}
            <div className="max-w-6xl mx-auto mt-8 space-y-5">
                {interviews.map((item, index) => (
                    <motion.div
                    
                        key={item._id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.4,
                            delay: index * 0.1,
                        }}
                        whileHover={{
                            y: -4,
                            scale: 1.01,
                            
                        }}
                        onClick={()=>navigate(`/report/${item._id}`)}
                        className="cursor-pointer bg-white rounded-3xl shadow-md p-6 flex justify-between items-center"
                    >
                        <div>
                            <h2 className="text-xl font-semibold text-yellow-600 capitalize">
                                Role: {item.role}
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Interview Type: {item.mode}
                            </p>

                            <p className="text-sm text-gray-400 mt-2">
                                Conducted on {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                    <h2
                                        className={`text-3xl font-bold ${item.status === "Completed"
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {item.finalScore || 0}/10
                                    </h2>

                                    <p className="text-gray-400 text-sm font-bold">
                                        Overall Score
                                    </p>
                                </div>

                                <span
                                    className={`px-4 py-1 rounded-full text-xs font-medium ${item.status === "Completed"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {item.status}
                                </span>
                            </div>

                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default InterviewHistory;