import express from 'express'
import isAuth from "../middleware/isAuth.js";
import  { upload }  from '../middleware/multer.js';
import { AnalyzeResume } from '../controllers/interview.controller.js';
 
const interviewRouter = express.Router();

interviewRouter.post("/resume",isAuth,upload.single("resume"),AnalyzeResume)

export default interviewRouter;