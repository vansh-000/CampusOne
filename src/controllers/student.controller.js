import { Student } from "../models/student.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const createStudent = asyncHandler(async (req, res) => {
    const {
        userId,
        institutionId,
        branchId,
        enrollmentNumber,
        courseIds,
        semester,
        admissionYear,
        hostelStatus,
        guardianDetails
    } = req.body;

    if (
        !userId ||
        !institutionId ||
        !branchId ||
        !enrollmentNumber ||
        !semester ||
        !admissionYear
    ) {
        throw new ApiError("All required fields must be provided", 400);
    }

    const exists = await Student.findOne({
        $or: [{ userId }, { enrollmentNumber }]
    });

    if (exists) {
        throw new ApiError(
            "Student already exists with this user or enrollment number",
            409
        );
    }

    const student = await Student.create({
        userId,
        institutionId,
        branchId,
        enrollmentNumber,
        courseIds: courseIds || [],
        semester,
        admissionYear,
        hostelStatus: hostelStatus ?? false,
        guardianDetails: guardianDetails || []
    });

    res.json(
        new ApiResponse("Student created successfully", 201, student)
    );
});

const editStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    delete req.body.userId;
    delete req.body.institutionId;
    if (req.body.enrollmentNumber) {
        throw new ApiError("Enrollment number cannot be changed", 400);
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        req.body,
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Student updated successfully", 200, student)
    );
});

const getStudentsByInstitution = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;

    const students = await Student.find({ institutionId })
        .populate("userId", "name email phone")
        .populate("branchId", "name")
        .populate("courseIds", "name code");

    res.json(
        new ApiResponse("Students fetched successfully", 200, students)
    );
});

const getStudentsByBranch = asyncHandler(async (req, res) => {
    const { branchId } = req.params;

    const students = await Student.find({ branchId, isActive: true })
        .populate("userId", "name email")
        .populate("courseIds", "name code");

    res.json(
        new ApiResponse("Students fetched successfully", 200, students)
    );
});

const getStudentById = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
        .populate("userId", "name email phone")
        .populate("institutionId", "name")
        .populate("branchId", "name")
        .populate("courseIds", "name code");

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Student fetched successfully", 200, student)
    );
});

const deleteStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await Student.findByIdAndDelete(studentId);

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Student deleted successfully", 200)
    );
});

const updateStudentBranch = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { branchId } = req.body;

    if (!branchId) {
        throw new ApiError("Branch ID is required", 400);
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        { branchId },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Branch updated successfully", 200, student)
    );
});

const updateStudentCourses = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { courseIds } = req.body;

    if (!Array.isArray(courseIds)) {
        throw new ApiError("courseIds must be an array", 400);
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        { courseIds },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Courses updated successfully", 200, student)
    );
});

const updateStudentSemester = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const updated = await Student.findOneAndUpdate(
        { _id: studentId },
        [
            {
                $set: {
                    prevCourses: {
                        $concatArrays: [
                            "$prevCourses",
                            {
                                $map: {
                                    input: "$courseIds",
                                    as: "c",
                                    in: {
                                        courseId: "$$c",
                                        semester: "$semester"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            { $set: { courseIds: [] } },
            { $set: { semester: { $add: ["$semester", 1] } } }
        ],
        {
            new: true,
            runValidators: true
        }
    );

    if (!updated) {
        throw new ApiError("Student not found", 404);
    }

    res.json(new ApiResponse("Semester updated successfully", 200, updated));
});


const updateHostelStatus = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { hostelStatus } = req.body;

    if (typeof hostelStatus !== "boolean") {
        throw new ApiError("hostelStatus must be boolean", 400);
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        { hostelStatus },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse(
            `Hostel status ${hostelStatus ? "enabled" : "disabled"}`,
            200,
            student
        )
    );
});

const modifyActiveStatus = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
        throw new ApiError("isActive must be boolean", 400);
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        { isActive },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse(
            `Student has been ${isActive ? "activated" : "deactivated"}`,
            200,
            student
        )
    );
});

export {
    createStudent,
    editStudent,
    getStudentsByInstitution,
    getStudentsByBranch,
    getStudentById,
    deleteStudent,
    updateStudentBranch,
    updateStudentCourses,
    updateStudentSemester,
    updateHostelStatus,
    modifyActiveStatus
};
