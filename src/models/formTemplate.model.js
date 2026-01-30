import mongoose from "mongoose";

const templateFieldSchema = new mongoose.Schema({
    fieldId: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    required: {
        type: Boolean,
        default: false
    },
    options: [String],
    validationRules: {
        type: Object,
        default: {}
    }

}, { _id: false });

const admissionFormTemplateSchema = new mongoose.Schema({

    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    version: {
        type: Number,
        default: 1
    },
    fields: [templateFieldSchema],
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

export const AdmissionFormTemplate = mongoose.model(
    "AdmissionFormTemplate",
    admissionFormTemplateSchema
);
