import Department from "../models/department.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Faculty } from '../models/faculty.model.js';

const createDepartment = asyncHandler(async (req, res) => {
  const { institutionId, name, code, contactEmail, headOfDepartment } = req.body;

  if (!institutionId || !name || !code || !contactEmail) {
    throw new ApiError("All fields are required", 400);
  }

  if (headOfDepartment) {
    const faculty = await Faculty.findById(headOfDepartment);
    if (!faculty) {
      throw new ApiError("Faculty not found", 404);
    }

    const facultyExists = await Department.findOne({ headOfDepartment });
    if (facultyExists && headOfDepartment !== null) {
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
  });

  res.json(
    new ApiResponse("Department created successfully", 201, department)
  );
});

const getDepartmentsByInstitution = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;

  const departments = await Department.find({
    institutionId: institutionId,
  }).populate("headOfDepartment", "designation userId");

  res.json(
    new ApiResponse("Departments fetched successfully", 200, departments)
  );
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  const department = await Department.findById(departmentId).populate(
    "headOfDepartment"
  );

  if (!department) {
    throw new ApiError("Department not found", 404);
  }

  res.json(
    new ApiResponse("Department fetched successfully", 200, department)
  );
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  const { name, code, headOfDepartment, contactEmail } = req.body;

  const department = await Department.findById(departmentId);
  if (!department) {
    throw new ApiError("Department not found", 404);
  }
  if (code && code !== department.code) {
    const exists = await Department.findOne({
      code,
      institutionId: department.institutionId,
      _id: { $ne: departmentId },
    });

    if (exists) {
      throw new ApiError(
        "Department with this code already exists in this institution",
        409
      );
    }

    department.code = code;
  }
  if (headOfDepartment) {
    const faculty = await Faculty.findById(headOfDepartment);
    if (!faculty) {
      throw new ApiError("Faculty not found", 404);
    }
    const facultyExists = await Department.findOne({ headOfDepartment });
    if (facultyExists && headOfDepartment !== null) {
      throw new ApiError("This faculty is already assigned as head of another department", 409);
    }
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

const checkDepartmentCodeExists = asyncHandler(async (req, res) => {
  const { institutionId, code } = req.body;
  if(!code){
    throw new ApiError("Department code is required", 400);
  }

  const exists = await Department.findOne({ code, institutionId });
  if (exists) {
    return res.json(
      new ApiResponse("Department code already exists", 200, { exists: true })
    );
  } else {
    return res.json(
      new ApiResponse("Department code is available", 200, { exists: false })
    );
  }
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  const department = await Department.findByIdAndDelete(departmentId);

  if (!department) {
    throw new ApiError("Department not found", 404);
  }

  res.json(
    new ApiResponse("Department deleted successfully", 200)
  );
});

export {
  createDepartment,
  getDepartmentsByInstitution,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  checkDepartmentCodeExists
};
