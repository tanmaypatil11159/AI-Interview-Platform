import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.js";

export const AnalyzeResume = async (req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({ message: "Resume pdf is required" });
        }
        const filePath = req.file.path;

        const fileBuffer = await fs.promises.readFile(filePath);
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

        const messages = [  // this is the prompt for the AI to extract structured data from the resume
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
        fs.unlinkSync(filePath)

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        })
    } catch (error) {
        console.log(error)

        if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
        message: error.message,
        });
    }
}