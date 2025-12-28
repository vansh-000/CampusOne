import Course from "../models/course.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createCourse = asyncHandler(async (req, res) => {
  const { departmentId, name, code, credits, semester } = req.body;

  if (!departmentId || !name || !code || credits === undefined || !semester) {
    throw new ApiError("All fields are required", 400);
  }

  const exists = await Course.findOne({ code });
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

  const course = await Course.findByIdAndUpdate(
    courseId,
    req.body,
    { new: true }
  );

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

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

export {
  createCourse,
  getCoursesByDepartment,
  getCourseById,
  updateCourse,
  deleteCourse,
};
