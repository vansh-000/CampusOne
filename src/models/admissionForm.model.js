import mongoose from "mongoose";

const filledFieldSchema = new mongoose.Schema({
    fieldId: {
        type: String,
        required: true
    },
    fieldName: {
        type: String,
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    fileUrl: String

}, { _id: false });

const documentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    extractedData: {
        type: Object,
    },
    verifiedStatus: {
        type: String,
        enum: ["PENDING", "VERIFIED", "REJECTED"],
        default: "PENDING"
    }

}, { _id: false });

const admissionApplicationSchema = new mongoose.Schema({
    applicationNumber: {
        type: String,
        unique: true,
        required: true
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdmissionFormTemplate",
        required: true
    },
    templateVersion: {
        type: Number,
        required: true
    },
    filledFields: [filledFieldSchema],
    documents: [documentSchema],
    eligibilityCheckResult: {
        type: Boolean,
        reason: {
            type: String,
            required: String
        }
    },
    agentReviewLogs: [
        {
            message: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    formStatus: {
        type: String,
        enum: [
            "DRAFT",
            "SUBMITTED",
            "UNDER_AI_REVIEW",
            "AI_APPROVED",
            "AI_REJECTED",
            "MANUAL_REVIEW",
            "FINAL_APPROVED",
            "FINAL_REJECTED"
        ],
        required: true,
        default: "SUBMITTED"
    }

}, { timestamps: true });

export const AdmissionApplication = mongoose.model("AdmissionApplication", admissionApplicationSchema);
