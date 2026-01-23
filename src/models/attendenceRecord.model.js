import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AttendanceSession",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    status: {
        type: String,
        enum: ["P", "A", "L", "H"], // Present, Absent, Late, Holiday
        required: true
    },
    reason: {
        type: String
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate marking for same session + student
attendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

// Fast analytics
attendanceRecordSchema.index({ courseId: 1, studentId: 1 });
attendanceRecordSchema.index({ sessionId: 1 });

export const AttendanceRecord = mongoose.model("AttendanceRecord", attendanceRecordSchema);
