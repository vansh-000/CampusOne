import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        trim: true
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    isOpen: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

branchSchema.index({ institutionId: 1 });
branchSchema.index({ departmentId: 1 });
branchSchema.index({ code: 1, institutionId: 1, departmentId: 1 }, { unique: true });

export const Branch = mongoose.model('Branch', branchSchema);