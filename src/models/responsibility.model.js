import mongoose from "mongoose";

const responsibilitySchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        category: {
            type: String,
            enum: [
                "Academic",
                "Administrative",
                "Hostel",
                "Estate",
            ],
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

responsibilitySchema.index(
    { institutionId: 1, code: 1 },
    { unique: true }
);

export const Responsibility = mongoose.model("Responsibility", responsibilitySchema);