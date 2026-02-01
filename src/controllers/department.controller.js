import Department from "../models/department.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Faculty } from '../models/faculty.model.js';
import Course from '../models/course.model.js';
import { Branch } from "../models/branch.model.js";
import mongoose from "mongoose";

const assertObjectId = (id, fieldName = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(`Invalid ${fieldName}`, 400);
  }
};

const createDepartment = asyncHandler(async (req, res) => {
  let { institutionId, name, code, contactEmail, headOfDepartment } = req.body;

  if (!institutionId || !name || !code || !contactEmail) {
    throw new ApiError("All fields are required", 400);
  }
  assertObjectId(institutionId, "institutionId");
  code = code.trim().toUpperCase();
  if (headOfDepartment) {
    assertObjectId(headOfDepartment, "headOfDepartment");
    const faculty = await Faculty.findOne({_id: headOfDepartment,institutionId});
    if (!faculty) {
      throw new ApiError("Faculty not found in this institution", 404);
    }

    const facultyAlreadyHOD = await Department.findOne({ headOfDepartment});
    if (facultyAlreadyHOD) {
      throw new ApiError("This faculty is already assigned as head of another department", 409);
    }
  }

  const exists = await Department.findOne({ code, institutionId });
  if (exists) {
    throw new ApiError("Department with this code already exists in your institution", 409);
  }

  const department = await Department.create({
    institutionId,
    name,
    code,
    contactEmail,
    headOfDepartment: headOfDepartment || null
  });

  res.json(
    new ApiResponse("Department created successfully", 201, department)
  );
});

const getDepartmentsByInstitution = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;

  assertObjectId(institutionId, "institutionId");
  const departments = await Department.find({ institutionId })
    .populate("headOfDepartment", "designation userId");

  res.json(new ApiResponse("Departments fetched successfully", 200, departments));
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  assertObjectId(departmentId, "departmentId");
  const department = await Department.findById(departmentId)
    .populate("headOfDepartment");

  if (!department) throw new ApiError("Department not found", 404);

  res.json(new ApiResponse("Department fetched successfully", 200, department));
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  let { name, code, contactEmail } = req.body;
  assertObjectId(departmentId, "departmentId");

  const department = await Department.findById(departmentId);
  if (!department) {
    throw new ApiError("Department not found", 404);
  }
  if (code && code !== department.code) {
    code = code.toUpperCase();
    const exists = await Department.findOne({
      code,
      institutionId: department.institutionId,
      _id: { $ne: departmentId }
    });

    if (exists) {
      throw new ApiError(
        "Department with this code already exists in this institution",
        409
      );
    }

    department.code = code;
  }
  if (contactEmail !== undefined) {
    department.contactEmail = contactEmail;
  }
  if (name !== undefined) {
    department.name = name;
  }
  await department.save();
  res.json(
    new ApiResponse("Department updated successfully", 200, department)
  );
});

const addHod = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  const { headOfDepartment } = req.body;

  assertObjectId(departmentId, "departmentId");
  assertObjectId(headOfDepartment, "headOfDepartment");

  const department = await Department.findById(departmentId);
  if (!department) {
    throw new ApiError("Department not found", 404);
  }

  const faculty = await Faculty.findById(headOfDepartment);
  if (!faculty) {
    throw new ApiError("Faculty not found", 404);
  }

  const facultyExists = await Department.findOne({ headOfDepartment });
  if (facultyExists) {
    throw new ApiError("This faculty is already assigned as head of another department", 409);
  }

  department.headOfDepartment = headOfDepartment;
  await department.save();

  res.json(
    new ApiResponse("Head of Department assigned successfully", 200, department)
  );
});

const removeHod = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  assertObjectId(departmentId, "departmentId");

  const department = await Department.findById(departmentId);
  if (!department) {
    throw new ApiError("Department not found", 404);
  }

  department.headOfDepartment = null;
  await department.save();

  res.json(
    new ApiResponse("Head of Department removed successfully", 200, department)
  );
});

const checkDepartmentCodeExists = asyncHandler(async (req, res) => {
  const { institutionId, code } = req.body;
  if (!code) {
    throw new ApiError("Department code is required", 400);
  }
  code = code.trim().toUpperCase();
  const exists = await Department.findOne({ code, institutionId });

  return res.json(
    new ApiResponse(
      exists ? "Department code already exists" : "Department code available",
      200,
      { exists: !!exists }
    )
  );
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  assertObjectId(departmentId, "departmentId");

  const department = await Department.findById(departmentId);
  if (!department) {
    throw new ApiError("Department not found", 404);
  }
  await Course.deleteMany({ departmentId });
  await Branch.deleteMany({ departmentId });
  await Faculty.updateMany(
    { departmentId },
    { $unset: { departmentId: "" }}
  );
  await department.deleteOne();

  res.json(new ApiResponse("Department and related data deleted successfully", 200)
  );
});

export {
  createDepartment,
  getDepartmentsByInstitution,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  checkDepartmentCodeExists,
  addHod,
  removeHod
};
