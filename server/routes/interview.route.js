import express from 'express'
import isAuth from "../middleware/isAuth.js";
import  { upload }  from '../middleware/multer.js';
import { AnalyzeResume, generateQuestions, submitAnswer, finishInterview } from '../controllers/interview.controller.js';
 
const interviewRouter = express.Router();

interviewRouter.post("/resume",isAuth,upload.single("resume"),AnalyzeResume)
interviewRouter.post("/generate-questions",isAuth,generateQuestions)
interviewRouter.post("/submit-answer",isAuth,submitAnswer)
interviewRouter.post("/finish",isAuth,finishInterview)

export default interviewRouter;