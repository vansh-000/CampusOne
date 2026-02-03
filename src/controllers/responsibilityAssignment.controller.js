import { ResponsibilityAssignment } from "../models/responsibilityAssignment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createResponsibilityAssignment = asyncHandler(async (req, res) => {
    const { responsibilityId, userId, assignedRole, startDate, endDate } = req.body;

    if (!responsibilityId || !userId || !assignedRole || !startDate || !endDate) {
        throw new ApiError("All fields are required", 400);
    }

    const assignment = await ResponsibilityAssignment.create({
        responsibilityId,
        userId,
        assignedRole,
        startDate,
        endDate
    });

    return res.status(201).json(
        new ApiResponse(assignment, "Responsibility assigned successfully")
    );
});

const getAllAssignments = asyncHandler(async (req, res) => {
    const assignments = await ResponsibilityAssignment.find()
        .populate("responsibilityId")
        .populate("userId");

    return res.status(200).json(
        new ApiResponse(assignments, "Assignments fetched successfully")
    );
});

const getAssignmentsByResponsibility = asyncHandler(async (req, res) => {
    const { responsibilityId } = req.params;

    const assignments = await ResponsibilityAssignment.find({ responsibilityId })
        .populate("userId");

    return res.status(200).json(
        new ApiResponse(assignments, "Assignments fetched successfully")
    );
});

const getActiveAssignments = asyncHandler(async (req, res) => {
    const assignments = await ResponsibilityAssignment.find({ isActive: true })
        .populate("responsibilityId")
        .populate("userId");

    return res.status(200).json(
        new ApiResponse(assignments, "Active assignments fetched successfully")
    );
});

const getAssignmentsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const assignments = await ResponsibilityAssignment.find({ userId })
        .populate("responsibilityId");

    return res.status(200).json(
        new ApiResponse(assignments, "User assignments fetched successfully")
    );
});

const updateResponsibilityAssignment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updated = await ResponsibilityAssignment.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
    );

    if (!updated) {
        throw new ApiError("Assignment not found", 404);
    }

    return res.status(200).json(
        new ApiResponse(updated, "Assignment updated successfully")
    );
});

const deactivateAssignment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const assignment = await ResponsibilityAssignment.findById(id);

    if (!assignment) {
        throw new ApiError("Assignment not found", 404);
    }

    assignment.isActive = false;
    await assignment.save();

    return res.status(200).json(
        new ApiResponse(null, "Assignment deactivated successfully")
    );
});

const deleteAssignment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deleted = await ResponsibilityAssignment.findByIdAndDelete(id);

    if (!deleted) {
        throw new ApiError("Assignment not found", 404);
    }

    return res.status(200).json(
        new ApiResponse(null, "Assignment deleted successfully")
    );
});

export {
    createResponsibilityAssignment,
    getAllAssignments,
    getAssignmentsByResponsibility,
    getActiveAssignments,
    getAssignmentsByUser,
    updateResponsibilityAssignment,
    deactivateAssignment,
    deleteAssignment
}