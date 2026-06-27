import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.router.js";
import interviewRouter from "./routes/interview.route.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview",interviewRouter)

const PORT = process.env.PORT || 6000;
const startServer = async () => {
    await connectDB();  
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();