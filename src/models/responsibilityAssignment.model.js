import mongoose from "mongoose";

const responsibilityAssignmentSchema = new mongoose.Schema(
    {
        responsibilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Responsibility',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedRole: {
            type: String,
            required: true,
            enum: ['Head', 'Member', 'Faculty_Incharge', 'Associate_Faculty_Incharge', 'Coordinator']
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);
responsibilityAssignmentSchema.index({ responsibilityId: 1 });
responsibilityAssignmentSchema.index({
    responsibilityId: 1,
    isActive: 1
});
responsibilityAssignmentSchema.index({ userId: 1 });
responsibilityAssignmentSchema.index(
    { responsibilityId: 1, userId: 1, isActive: 1 },
    { unique: true, partialFilterExpression: { isActive: true } }
);

export const ResponsibilityAssignment = mongoose.model("ResponsibilityAssignment", responsibilityAssignmentSchema);