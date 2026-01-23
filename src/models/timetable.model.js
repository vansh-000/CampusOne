import mongoose from "mongoose";

const timetableSlotSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true
        },
        batch: {
            type: String,
            required: true
        },
        semester: {
            type: Number,
            required: true
        },
        dayOfWeek: {
            type: String,
            enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            required: true
        },
        startTime: {
            type: String, // "HH:MM"
            required: true
        },
        endTime: {
            type: String, // "HH:MM"
            required: true
        },
        room: {
            type: String
        },
        type: {
            type: String,
            enum: ["Lecture", "Lab", "Tutorial"],
            default: "Lecture"
        }
    },
    { timestamps: true }
);

timetableSlotSchema.index({ institutionId: 1, facultyId: 1, dayOfWeek: 1, startTime: 1 });
timetableSlotSchema.index({ institutionId: 1, batch: 1, semester: 1, dayOfWeek: 1, startTime: 1 });

export const TimetableSlot = mongoose.model("TimetableSlot", timetableSlotSchema);
