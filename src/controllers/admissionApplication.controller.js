import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AdmissionApplication } from "../models/admissionApplication.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cookiesOptions } from "../utils/cookiesOptions.js";

const generateApplicationNumber = () => {
  return "APP-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

const registerAdmissionApplication = asyncHandler(async (req, res) => {

  const {
    password,
    institutionId,
    branchId,
    fullName,
    email,
    phone,
    dateOfBirth,
    gender,
    category,
    address,
    city,
    state,
    pincode,
    tenthMarks,
    tenthBoard,
    tenthPassingYear,
    twelfthMarks,
    twelfthBoard,
    twelfthPassingYear
  } = req.body;

  if (
    !password || !institutionId || !branchId ||
    !fullName || !email || !phone ||
    !dateOfBirth || !gender || !category ||
    !address || !city || !state || !pincode ||
    !tenthMarks || !tenthBoard || !tenthPassingYear ||
    !twelfthMarks || !twelfthBoard || !twelfthPassingYear
  ) {
    throw new ApiError("All required fields must be provided", 400);
  }

  const existingApplication = await AdmissionApplication.findOne({ email });
  if (existingApplication) {
    throw new ApiError("Application already exists for this email", 400);
  }

  const applicationNumber = generateApplicationNumber();

  const application = await AdmissionApplication.create({
    ...req.body,
    applicationNumber
  });

  res.json(
    new ApiResponse(
      "Admission application submitted successfully",
      201,
      {
        applicationNumber,
        applicationId: application._id
      }
    )
  );
});

const loginAdmissionApplication = asyncHandler(async (req, res) => {

  const { applicationNumber, password } = req.body;

  if (!applicationNumber || !password) {
    throw new ApiError("Application number and password required", 400);
  }

  const application = await AdmissionApplication.findOne({ applicationNumber });

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  const isMatch = await application.comparePassword(password);

  if (!isMatch) {
    throw new ApiError("Invalid credentials", 401);
  }

  const accessToken = application.generateAccessToken();
  const refreshToken = application.generateRefreshToken();

  res.cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, {
      ...cookiesOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse("Application login successful", 200, {
        applicationNumber
      })
    );
});

const logoutAdmissionApplication = asyncHandler(async (req, res) => {

  res
    .clearCookie("accessToken", cookiesOptions)
    .clearCookie("refreshToken", cookiesOptions)
    .json(new ApiResponse("Logged out successfully", 200));

});

const refreshAdmissionAccessToken = asyncHandler(async (req, res) => {

  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError("Refresh token missing", 401);

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError("Refresh token expired", 401);
  }

  const application = await AdmissionApplication.findById(decoded.id);
  if (!application) throw new ApiError("Application not found", 404);

  const newAccessToken = application.generateAccessToken();
  const newRefreshToken = application.generateRefreshToken();

  res
    .cookie("accessToken", newAccessToken, cookiesOptions)
    .cookie("refreshToken", newRefreshToken, {
      ...cookiesOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse("Token refreshed", 200));

});

const getCurrentAdmissionApplication = asyncHandler(async (req, res) => {

  const application = await AdmissionApplication.findById(req.user.id)
    .select("-password");

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  res.json(new ApiResponse("Application fetched successfully", 200, application));

});

const getApplicationStatusByNumber = asyncHandler(async (req, res) => {

  const { applicationNumber } = req.params;

  const application = await AdmissionApplication.findOne({ applicationNumber })
    .select("formStatus eligibilityCheckResult reviewLogs updatedAt");

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  res.json(
    new ApiResponse("Application status fetched", 200, application)
  );

});

const updateAdmissionApplication = asyncHandler(async (req, res) => {

  const applicationId = req.user.id;

  const application = await AdmissionApplication.findByIdAndUpdate(
    applicationId,
    req.body,
    { new: true }
  ).select("-password");

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  res.json(
    new ApiResponse("Application updated successfully", 200, application)
  );

});

const updateAdmissionApplicationStatus = asyncHandler(async (req, res) => {

  const { applicationId } = req.params;
  const { formStatus, eligibilityCheckResult } = req.body;

  const application = await AdmissionApplication.findByIdAndUpdate(
    applicationId,
    {
      formStatus,
      eligibilityCheckResult
    },
    { new: true }
  );

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  res.json(
    new ApiResponse("Application status updated", 200, application)
  );

});

const addAdmissionReviewLog = asyncHandler(async (req, res) => {

  const { applicationId } = req.params;
  const { message } = req.body;

  if (!message) {
    throw new ApiError("Log message required", 400);
  }

  const application = await AdmissionApplication.findById(applicationId);

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  application.reviewLogs.push({ message });
  await application.save();

  res.json(new ApiResponse("Review log added", 200, application));

});

const deleteAdmissionApplication = asyncHandler(async (req, res) => {

  const { applicationId } = req.params;

  const application = await AdmissionApplication.findById(applicationId);

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  await AdmissionApplication.findByIdAndDelete(applicationId);

  res.json(new ApiResponse("Application deleted successfully", 200));

});

// TODO: change password
// TODO: reset password
// TODO: verify email


export {
  registerAdmissionApplication,
  loginAdmissionApplication,
  logoutAdmissionApplication,
  refreshAdmissionAccessToken,
  getCurrentAdmissionApplication,
  getApplicationStatusByNumber,
  updateAdmissionApplication,
  updateAdmissionApplicationStatus,
  addAdmissionReviewLog,
  deleteAdmissionApplication
};
