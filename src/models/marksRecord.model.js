import mongoose from "mongoose";


const marksRecordSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Types.ObjectId, ref: "Student", required: true },
        courseId: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
        facultyId: { type: mongoose.Types.ObjectId, ref: "Faculty", required: true },
        batch: { type: String, required: true },
        semester: { type: Number, required: true },
        component: { type: String, required: true },
        marks: { type: Number, required: true },
        maxMarks: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

marksRecordSchema.index(
    { studentId: 1, courseId: 1, component: 1 },
    { unique: true }
);

export const MarksRecord = mongoose.model("MarksRecord", marksRecordSchema);
