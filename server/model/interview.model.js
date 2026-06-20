import mongoose, { mongo } from "mongoose";

// For each question
const questionSchema = new mongoose.Schema({  
    question: String,
    difficulty: String,       // easy, medium, hard
    timeLimit: Number,
    answer: String,
    feedback: String,
    score: {type: Number, default: 0},
    confidence: {type: Number, default: 0},
    communication: {type: Number, default: 0},
    correctness: {type: Number, default: 0}
},{timestamps:true});


// For each interview
const interviewSchema = new mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        required: true
    },
    experiance: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['HR','Technical'],
        required: true
    },
    resumeText: {
        type: String
    },
    questions: [questionSchema],                // Already defined on top start
    finalScore: {type: Number, default: 0},
    status: {
        type: String,
        enum: ['Incompleted','Completed'],
        default: 'Incompleted'
    }
},{timestamps:true});

const Interview = mongoose.model(interviewSchema,questionSchema)

export default Interview

