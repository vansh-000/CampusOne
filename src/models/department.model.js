import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Institution',
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
        headOfDepartment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Faculty',
            default: null
        },
        contactEmail: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

departmentSchema.index({ institutionId: 1 });
db.depts.createIndex(
    { headOfDepartment: 1 },
    { unique: true, partialFilterExpression: { headOfDepartment: { $exists: true } } }
);
departmentSchema.index({ code: 1, institutionId: 1 }, { unique: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;