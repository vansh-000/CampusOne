import { Branch } from "../models/branch.model.js";
import Department from "../models/department.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createBranch = asyncHandler(async (req, res) => {
    const { name, code, departmentId } = req.body;
    const { institutionId } = req.params;

    if (!name || !code || !departmentId || !institutionId) {
        throw new ApiError("Missing required fields", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(institutionId) || !mongoose.Types.ObjectId.isValid(departmentId)) {
        throw new ApiError("Invalid institution or department id", 400);
    }

    const dept = await Department.findOne({ _id: departmentId, institutionId });
    if (!dept) throw new ApiError("Department does not belong to institution", 400);

    const existingBranch = await Branch.findOne({ code, departmentId, institutionId });
    if (existingBranch) throw new ApiError("Branch with same code already exists in this department", 409);

    const branch = await Branch.create({
        name,
        code,
        institutionId,
        departmentId,
        isOpen: true
    });

    res.json(new ApiResponse("Branch created successfully", 201, branch));
});


const getBranchesByInstitution = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new ApiError("Invalid institution id", 400);
    }

    const branches = await Branch.find({ institutionId });

    res.json(new ApiResponse("Branches fetched successfully", 200, branches));
});


const getBranchById = asyncHandler(async (req, res) => {
    const { branchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
        throw new ApiError("Invalid branch id", 400);
    }

    const branch = await Branch.findById(branchId);

    if (!branch) throw new ApiError("Branch not found", 404);

    res.json(new ApiResponse("Branch fetched successfully", 200, branch));
});


const getBranchByDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        throw new ApiError("Invalid department id", 400);
    }

    const branches = await Branch.find({ departmentId });

    res.json(new ApiResponse("Branches fetched successfully", 200, branches));
});


const updateBranch = asyncHandler(async (req, res) => {
    const { branchId } = req.params;
    const { name, code, departmentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
        throw new ApiError("Invalid branch id", 400);
    }

    const branch = await Branch.findById(branchId);
    if (!branch) throw new ApiError("Branch not found", 404);

    if (code) {
        const duplicate = await Branch.findOne({
            code,
            institutionId: branch.institutionId,
            departmentId: departmentId || branch.departmentId,
            _id: { $ne: branchId }
        });
        if (duplicate) throw new ApiError("Branch code already exists for this department", 409);
    }

    if (departmentId) {
        const dept = await Department.findOne({ _id: departmentId, institutionId: branch.institutionId });
        if (!dept) throw new ApiError("Department does not belong to this institution", 400);
    }

    branch.name = name || branch.name;
    branch.code = code || branch.code;
    branch.departmentId = departmentId || branch.departmentId;

    await branch.save();

    res.json(new ApiResponse("Branch updated successfully", 200, branch));
});


const deleteBranch = asyncHandler(async (req, res) => {
    const { branchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
        throw new ApiError("Invalid branch id", 400);
    }

    const branch = await Branch.findById(branchId);
    if (!branch) throw new ApiError("Branch not found", 404);

    const students = await mongoose.model("Student").findOne({ branchId });
    if (students) {
        throw new ApiError("Cannot delete branch with enrolled students", 400);
    }
    await branch.deleteOne();

    res.json(new ApiResponse("Branch deleted successfully", 200));
});


const changeBranchStatus = asyncHandler(async (req, res) => {
    const { branchId } = req.params;
    const { isOpen } = req.body;

    if (typeof isOpen !== "boolean") {
        throw new ApiError("isOpen must be boolean", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
        throw new ApiError("Invalid branch id", 400);
    }

    const branch = await Branch.findById(branchId);
    if (!branch) throw new ApiError("Branch not found", 404);

    const students = await mongoose.model("Student").findOne({ branchId });
    if (students && !isOpen) {
        throw new ApiError("Cannot close branch with enrolled students", 400);
    }

    branch.isOpen = isOpen;
    await branch.save();

    res.json(new ApiResponse("Branch status updated successfully", 200, branch));
});


export {
    createBranch,
    getBranchesByInstitution,
    getBranchById,
    getBranchByDepartment,
    updateBranch,
    deleteBranch,
    changeBranchStatus
};
