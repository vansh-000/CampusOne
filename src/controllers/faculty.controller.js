import {Faculty} from "../models/faculty.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Department from "../models/department.model.js";
import mongoose from "mongoose";

const createFaculty = asyncHandler(async (req, res) => {
    const {
        userId,
        institutionId,
        departmentId,
        designation,
        courses,
        dateOfJoining,
    } = req.body;

    if (!userId || !institutionId || !departmentId || !designation || !dateOfJoining) {
        throw new ApiError("All required fields must be provided", 400);
    }

    const exists = await Faculty.findOne({ userId });
    if (exists) throw new ApiError("Faculty already exists for this user", 409);

    const dept = await Department.findOne({ _id: departmentId, institutionId });
    if (!dept) throw new ApiError("Department does not belong to institution", 400);

    if (courses && Array.isArray(courses)) {
        for (const c of courses) {
            if (!c.courseId || !c.semester || !c.batch) {
                throw new ApiError("Each course must include courseId, semester & batch", 400);
            }
        }
    }

    const faculty = await Faculty.create({
        userId,
        institutionId,
        departmentId,
        designation,
        courses: courses || [],
        dateOfJoining,
    });

    res.json(
        new ApiResponse("Faculty created successfully", 201, faculty)
    );
});


const editFaculty = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;

    const faculty = await Faculty.findByIdAndUpdate(
        facultyId,
        {
            $set: {
                designation: req.body.designation,
                dateOfJoining: req.body.dateOfJoining
            }
        },
        { new: true, runValidators: true }
    );

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse("Faculty updated successfully", 200, faculty)
    );
});

const getFacultiesByInstitution = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;

    const faculties = await Faculty.find({ institutionId })
        .populate("userId", "name email phone")
        .populate("departmentId", "name")
        .populate("courses.courseId", "name code");

    res.json(
        new ApiResponse("Faculties fetched successfully", 200, faculties)
    );
});

const getFacultiesByDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;

    const faculties = await Faculty.find({ departmentId })
        .populate("userId", "name email phone")
        .populate("courses.courseId", "name code");

    res.json(
        new ApiResponse("Faculties fetched successfully", 200, faculties)
    );
});

const getFacultyById = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;

    const faculty = await Faculty.findById(facultyId)
        .populate("userId", "name email phone")
        .populate("institutionId", "name")
        .populate("departmentId", "name")
        .populate("courses.courseId", "name code")
        .populate("prevCourses.courseId", "name code");

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse("Faculty fetched successfully", 200, faculty)
    );
});

const deleteFaculty = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;

    const faculty = await Faculty.findByIdAndDelete(facultyId);

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse("Faculty deleted successfully", 200)
    );
});

const updateFacultyDepartment = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;
    const { departmentId } = req.body;

    if (!departmentId) {
        throw new ApiError("Department ID is required", 400);
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) throw new ApiError("Faculty not found", 404);

    const dept = await Department.findOne({ _id: departmentId, institutionId: faculty.institutionId });
    if (!dept) throw new ApiError("Department does not belong to this institution", 400);

    faculty.departmentId = departmentId;
    await faculty.save();

    res.json(
        new ApiResponse("Department updated successfully", 200, faculty)
    );
});

const updateFacultyCourses = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;
    const { courses } = req.body;

    if (!Array.isArray(courses)) throw new ApiError("Courses must be an array", 400);

    for (const c of courses) {
        if (!c.courseId || !c.semester || !c.batch) {
            throw new ApiError("Each course must include courseId, semester & batch", 400);
        }
    }

    const faculty = await Faculty.findByIdAndUpdate(
        facultyId,
        { courses },
        { new: true }
    );

    if (!faculty) throw new ApiError("Faculty not found", 404);

    res.json(new ApiResponse("Courses updated successfully", 200, faculty));
});

const finishFacultyCourse = asyncHandler(async (req, res) => {
    const { facultyId, courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new ApiError("Invalid courseId", 400);
    }

    const updated = await Faculty.findOneAndUpdate(
        { _id: facultyId },
        [
            {
                $set: {
                    prevCourses: {
                        $concatArrays: [
                            "$prevCourses",
                            {
                                $filter: {
                                    input: "$courses",
                                    as: "c",
                                    cond: { $eq: ["$$c.courseId", new mongoose.Types.ObjectId(courseId)] }
                                }
                            }
                        ]
                    },
                    courses: {
                        $filter: {
                            input: "$courses",
                            as: "c",
                            cond: { $ne: ["$$c.courseId", new mongoose.Types.ObjectId(courseId)] }
                        }
                    }
                }
            }
        ],
        { new: true }
    );

    if (!updated) throw new ApiError("Faculty not found or course not present", 404);

    res.json(new ApiResponse("Course moved to previous courses", 200, updated));
});

const modifyActiveStatus = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
        throw new ApiError("isActive must be boolean", 400);
    }

    const faculty = await Faculty.findByIdAndUpdate(
        facultyId,
        { isActive },
        { new: true }
    );

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse(
            `Faculty has been ${isActive ? "activated" : "deactivated"}`,
            200,
            faculty
        )
    );
});

const toggleFacultyInCharge = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;
    const { isInCharge } = req.body;

    if (typeof isInCharge !== "boolean") {
        throw new ApiError("isInCharge must be boolean", 400);
    }

    const faculty = await Faculty.findByIdAndUpdate(
        facultyId,
        { isInCharge },
        { new: true }
    );

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse(
            `Faculty ${isInCharge ? "marked" : "unmarked"} as in-charge`,
            200,
            faculty
        )
    );
});

export {
    createFaculty,
    editFaculty,
    getFacultiesByInstitution,
    getFacultiesByDepartment,
    getFacultyById,
    deleteFaculty,
    updateFacultyDepartment,
    updateFacultyCourses,
    finishFacultyCourse,
    modifyActiveStatus,
    toggleFacultyInCharge,
};
