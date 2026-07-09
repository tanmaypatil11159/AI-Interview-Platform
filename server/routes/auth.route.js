import express from 'express';
import { googleAuth, logout, testAuth } from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/test', testAuth);
authRouter.post('/google',googleAuth);
authRouter.post('/logout',logout);

export default authRouter;