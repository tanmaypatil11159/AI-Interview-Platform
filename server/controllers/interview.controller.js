import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.js";
import User from "../model/user.model.js";
import Interview from "../model/interview.model.js";

export const AnalyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume pdf is required" });
        }

        let fileBuffer;
        const filePath = req.file.path;

        if (req.file.buffer && req.file.buffer.length) {
            fileBuffer = Buffer.from(req.file.buffer);
        } else if (filePath) {
            fileBuffer = await fs.promises.readFile(filePath);
        } else {
            return res.status(400).json({ message: "Resume file content is empty" });
        }

        const uint8Array = new Uint8Array(fileBuffer);

        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            const pageText = textContent.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }

        resumeText = resumeText.replace(/\s+/g, ' ').trim();  // filtering unnecessary text

        // this is the prompt for the AI to extract structured data from the resume
        const messages = [
            {
                role: "system",
                content: `
                Extract structured data from the resume.

                Return strictly JSON:

                {
                "role": "string",
                "experience": "string",
                "projects": ["project1", "project2"],
                "skills": ["skill1", "skill2"]
                }`,
            },
            {
                role: "user",
                content: resumeText,
            },
        ];

        const aiResponce = await askAi(messages);
        console.log(messages)
        const parsed = JSON.parse(aiResponce)

        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        })
    } catch (error) {
        console.log(error)

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            message: error.message,
        });
    }
}

export const generateQuestions = async (req, res) => {
    try {
        let {
            role,
            resumeText,
            mode,
            experience,
            projects,
            skills,
        } = req.body;

        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if (!role || !experience || !mode) {
            return res.status(400).json({
                message: "Information is missing.",
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // if (user.credits < 50) {
        //   return res.status(400).json({
        //     message: "Not enough credits. Minimum 50 credits are required.",
        //   });
        // }

        const projectText =
            Array.isArray(projects) && projects.length
                ? projects.join(", ")
                : "None";

        const skillText =
            Array.isArray(skills) && skills.length
                ? skills.join(", ")
                : "None";

        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
Role: ${role}
Experience: ${experience}
Interview Mode: ${mode}
Projects: ${projectText}
Skills: ${skillText}
Resume: ${safeResume}
`;

        const messages = [
            mode === 'Technical' ? (

                  {
    role: "system",
    content: `
You are a senior software engineer conducting a real technical interview.

Generate exactly 8 interview questions.

Rules:
- One question per line.
- No numbering.
- No bullet points.
- No explanations.
- No greetings or extra text.
- Questions must sound like a real interviewer.
- Focus only on technical knowledge relevant to the role.
- Include questions about programming concepts, problem solving, projects, best practices, and role-specific technologies.
- Avoid asking multiple questions in a single line.
- Difficulty should increase gradually.

Question 1 → Easy
Question 2 → Easy
Question 3 → Easy
Question 4 → Medium
Question 5 → Medium
Question 6 → Medium
Question 7 → Hard
Question 8 → Hard
`,
  }

            ) : (
                {
    role: "system",
    content: `
You are an experienced HR interviewer conducting a professional HR interview.

Generate exactly 8 interview questions.

Rules:
- One question per line.
- No numbering.
- No bullet points.
- No explanations.
- No greetings or extra text.
- Questions should evaluate communication, confidence, personality, teamwork, leadership, adaptability, career goals, and workplace behavior.
- Avoid technical questions.
- Avoid asking multiple questions in a single line.
- Difficulty should increase gradually.

Question 1 → Easy
Question 2 → Easy
Question 3 → Easy
Question 4 → Medium
Question 5 → Medium
Question 6 → Medium
Question 7 → Hard
Question 8 → Hard
`,
  }

            ),
            {
                role: "user",
                content: userPrompt,
            },
        ];

        const aiResponse = await askAi(messages);

        if (!aiResponse?.trim()) {
            return res.status(500).json({
                message: "AI returned empty response.",
            });
        }

        const questionsArray = aiResponse
            .split("\n")
            .map((q) => q.trim())
            .filter(Boolean)
            .slice(0, 8);

        if (!questionsArray.length) {
            return res.status(500).json({
                message: "AI failed to generate questions.",
            });
        }

        user.credits -= 50;
        await user.save();

        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionsArray.map((q, index) => ({
                question: q,
                difficulty: ["easy", "easy", "easy", "medium", "medium", "medium", "hard", "hard"][index],
                timeLimit: [60, 60, 60, 90, 90, 90, 120, 120][index],
            })),
        });

        return res.status(200).json({
            interviewId: interview._id,
            creditsLeft: user.credits,
            userName: user.name,
            mode: interview.mode,
            questions: interview.questions,
        });
    } catch (error) {
        console.error("Generate Questions Error:", error);

        return res.status(500).json({
            message: error.message,
        });
    }
};


export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body;

        const interview = await Interview.findById(interviewId);
        const question = interview.questions[questionIndex];

        if (!answer) {
            question.score = 0;
            question.feedback = "You did not submit an answer.";
            question.answer = "";

            await interview.save();

            return res.json({
                feedback: question.feedback
            })
        }

        if (timeTaken > question.timeLimit) {
            question.score = 0;
            question.feedback = "Time limit exceeded. Answer not evaluated.";
            question.answer = answer;

            await interview.save();

            return res.json({
                feedback: question.feedback
            })

        }

        const messages = [
            {
                role: "system",
                content: `
            You are a professional human interviewer evaluating a candidate's answer in a real interview.

            Evaluate naturally and fairly, like a real person would.

            Score the answer in these areas (0 to 10):

            1. Confidence – Does the answer sound clear, confident, and well-presented?
            2. Communication – Is the language simple, clear, and easy to understand?
            3. Correctness – Is the answer accurate, relevant, and complete?
            4. Technical - Does the candidate demonstrate strong understanding of the technology, concepts, implementation details, and best practices related to the topic?

            Rules:
            - Be realistic and unbiased.
            - Do not give random high scores.
            - If the answer is weak, score low.
            - If the answer is strong and detailed, score high.
            - Consider clarity, structure, and relevance.

            Calculate:
            finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

            Feedback Rules:
            - Write natural human feedback.
            - 10 to 15 words only.
            - Sound like real interview feedback.
            - Can suggest improvement if needed.
            - Do NOT repeat the question.
            - Do NOT explain scoring.
            - Keep tone professional and honest.

            Return ONLY valid JSON in this format:

            {
            "confidence": number,
            "communication": number,
            "correctness": number,
            "technical": number,
            "finalScore": number,
            "feedback": "short human feedback"
            }
            `
            },
            {
                role: "user",
                content: `
            Question: ${question.question}
            Answer: ${answer}
            `
            }
        ];

        const aiResponce = await askAi(messages)

        const parsed = JSON.parse(aiResponce)

        console.log("parsed")

        question.answer = answer;
        question.timeTaken = timeTaken || 0; // save time taken
        question.confidence = parsed.confidence;
        question.communication = parsed.communication;
        question.correctness = parsed.correctness;
        question.technical = parsed.technical;
        question.score = parsed.finalScore;
        question.feedback = parsed.feedback;

        await interview.save();
        return res.status(200).json({
            feedback: parsed.feedback
        });

    } catch (error) {
        return res.status(500).json({
            message: `Failed to submit the answer ${error}`
        })
    }
}


export const finishInterview = async (req, res) => {
    try {

        const { interviewId } = req.body;
        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(400).json({
                message: "Failed to fetch interview",
            });
        }

        const totalQuestions = interview.questions.length;

        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;
        let totalTechnical = 0;

        interview.questions.forEach((q) => {
            totalScore += q.score || 0;
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
            totalTechnical += q.technical || 0;
        });

        const finalScore = totalQuestions
            ? totalScore / totalQuestions
            : 0;

        const averageConfidence = totalQuestions
            ? totalConfidence / totalQuestions
            : 0;

        const averageCommunication = totalQuestions
            ? totalCommunication / totalQuestions
            : 0;

        const averageCorrectness = totalQuestions
            ? totalCorrectness / totalQuestions
            : 0;

        const averageTechnical = totalQuestions
            ? totalTechnical / totalQuestions
            : 0;

        interview.finalScore = finalScore
        interview.status = 'Completed'

        await interview.save()

        return res.status(200).json({
            interviewId: interview._id,
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number(averageConfidence.toFixed(1)),
            communication: Number(averageCommunication.toFixed(1)),
            correctness: Number(averageCorrectness.toFixed(1)),
            technical: Number(averageTechnical.toFixed(1)),

            questionWiseScore: interview.questions.map((q) => ({
                question: q.question,
                answer: q.answer,
                timeTaken: q.timeTaken || 0,
                score: q.score || 0,
                feedback: q.feedback || "",
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
                technical: q.technical || 0,
            })),
        });

    } catch (error) {
        return res.status(500).json({
            message: `Failed to finish interview ${error}`
        })
    }
}

export const getMyInterview = async (req, res) => {
    try {
        const interview = await Interview.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select("role experience mode finalScore status createdAt")

        return res.status(200).json(interview)


    } catch (e) {
        return res.status(500).json({ message: "faild find the interview" })

    }
}

export const getInterviewReport = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found.",
            });
        }

        const totalQuestions = interview.questions?.length || 0;

        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;
        let totalTechnical = 0;

        interview.questions.forEach((q) => {
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
            totalTechnical += q.technical || 0;
        });

        const averageConfidence =
            totalQuestions > 0
                ? totalConfidence / totalQuestions
                : 0;

        const averageCommunication =
            totalQuestions > 0
                ? totalCommunication / totalQuestions
                : 0;

        const averageCorrectness =
            totalQuestions > 0
                ? totalCorrectness / totalQuestions
                : 0;

        const averageTechnical =
            totalQuestions > 0
                ? totalTechnical / totalQuestions
                : 0;

        const finalScore = interview.finalScore || 0;

        return res.status(200).json({
            finalScore: Number(finalScore.toFixed(1)),

            confidence: Number(
                averageConfidence.toFixed(1)
            ),

            communication: Number(
                averageCommunication.toFixed(1)
            ),

            correctness: Number(
                averageCorrectness.toFixed(1)
            ),

            technical: Number(
                averageTechnical.toFixed(1)
            ),

            mode: interview.mode,

            questionWiseScore: interview.questions.map((q) => ({
                question: q.question,
                answer: q.answer,
                timeTaken: q.timeTaken || 0,
                score: q.score || 0,
                feedback: q.feedback || "",
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
                technical: q.technical || 0,
            })),
        });
    } catch (e) {
        console.error("Interview Report Error:", e);
        return res.status(500).json({
            message: e.message,
        });
    }
};