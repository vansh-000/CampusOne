import mongoose from "mongoose";

const applicationFlowNodeSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fromResponsibilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Responsibility",
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        toResponsibilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Responsibility",
        },
        message: {
            type: String,
        },
        actionType: {
            type: String,
            enum: ["forwarded", "approved", "rejected"],
            required: true,
        },
        previousNodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ApplicationFlowNode",
            default: null,
        },
        nextNodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ApplicationFlowNode",
            default: null,
        },
        actionDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const ApplicationFlowNode = mongoose.model("ApplicationFlowNode", applicationFlowNodeSchema);