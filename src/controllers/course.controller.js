import Course from "../models/course.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Department from "../models/department.model.js";

const createCourse = asyncHandler(async (req, res) => {
  const { departmentId, name, code, credits, semester } = req.body;

  if (!departmentId || !name || !code || credits === undefined || !semester) {
    throw new ApiError("All fields are required", 400);
  }

  const exists = await Course.findOne({ code, departmentId });
  if (exists) {
    throw new ApiError("Course with this code already exists", 409);
  }

  const course = await Course.create({
    departmentId,
    name,
    code,
    credits,
    semester,
  });

  res.json(
    new ApiResponse("Course created successfully", 201, course)
  );
});

const getCoursesByDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  const courses = await Course.find({ departmentId });

  res.json(
    new ApiResponse("Courses fetched successfully", 200, courses)
  );
});

const getCourseById = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId).populate(
    "departmentId",
    "name code"
  );

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  res.json(
    new ApiResponse("Course fetched successfully", 200, course)
  );
});

const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { code, departmentId, name, credits, semester } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  if (departmentId && departmentId.toString() !== course.departmentId.toString()) {
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      throw new ApiError("Invalid department", 400);
    }
  }

  if (code || departmentId) {
    const newCode = code ?? course.code;
    const newDept = departmentId ?? course.departmentId;

    const exists = await Course.findOne({
      _id: { $ne: courseId },
      code: newCode,
      departmentId: newDept
    });

    if (exists) {
      throw new ApiError(
        "A course with this code already exists in this department",
        409
      );
    }
  }

  if (credits !== undefined && credits < 0) {
    throw new ApiError("Credits must be a non-negative number", 400);
  }

  course.name = name ?? course.name;
  course.code = code ?? course.code;
  course.credits = credits ?? course.credits;
  course.semester = semester ?? course.semester;
  course.departmentId = departmentId ?? course.departmentId;

  await course.save();

  res.json(
    new ApiResponse("Course updated successfully", 200, course)
  );
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findByIdAndDelete(courseId);

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  res.json(
    new ApiResponse("Course deleted successfully", 200)
  );
});

const modifyStatus = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { isOpen } = req.body;

  if (isOpen === undefined) {
    throw new ApiError("isOpen field is required", 400);
  }
  const course = await Course.findByIdAndUpdate(
    courseId,
    { isOpen },
    { new: true }
  );

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  res.json(
    new ApiResponse("Course status updated successfully", 200, course)
  );
});

export {
  createCourse,
  getCoursesByDepartment,
  getCourseById,
  updateCourse,
  deleteCourse,
  modifyStatus
};
