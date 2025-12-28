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
            unique: true
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
        }
    },
    {
        timestamps: true
    }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;