import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            trim: true,
        },
        credits: {
            type: Number,
            required: true,
            min: 0
        },
        semester: {
            type: String,
            required: true,
            trim: true
        },
        evaluationScheme: {
            type: String,
            enum: ["MID_END", "CT_END"],
            required: true,
            default: "MID_END"
        },

        components: [
            {
                name: { type: String, required: true },  // e.g MID, END or CT1, CT2, END, LAB
                maxMarks: { type: Number, required: true },
                type: { type: String, enum: ["THEORY", "LAB"], default: "THEORY" }
            }
        ],
        isOpen: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

courseSchema.index({ departmentId: 1 });
courseSchema.index(
    { code: 1, departmentId: 1 },
    { unique: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;