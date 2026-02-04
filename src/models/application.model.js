import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        applicantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true,
        },
        applicationType: {
            type: String,
            enum: ["leave", "dayout", "vacation", "certificate", "general"],
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        currentStatus: {
            type: String,
            enum: ["pending", "forwarded", "approved", "rejected"],
            default: "pending",
        },
        initialStepId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ApplicationFlowNode",
        },
        currentStepId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ApplicationFlowNode",
        },
    },
    { timestamps: true }
);

export const Application = mongoose.model("Application", applicationSchema);