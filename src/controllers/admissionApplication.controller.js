import crypto from "crypto";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cookiesOptions } from "../utils/cookiesOptions.js";
import { AdmissionApplication } from "../models/admissionApplication.model.js";

const generateApplicationNumber = () => {
  return "APP-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

const registerAdmissionApplication = asyncHandler(async (req, res) => {
  const {
    password,
    institutionId,
    branchId,
    fullName,
    fatherName,
    motherName,
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
    !fullName || !fatherName || !motherName || !email || !phone ||
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

  const application = await AdmissionApplication.findOne({ applicationNumber });

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

const forgotAdmissionPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError("Email is required", 400);
  }

  const application = await AdmissionApplication.findOne({ email });
  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  const resetToken = application.getResetPasswordToken();
  await application.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/admission/reset-password/${resetToken}`;

  await sendEmail({
    email: application.email,
    subject: "Admission Password Reset",
    message: `Click the link to reset your password:\n\n${resetUrl}\n\nValid for 15 minutes.`
  });

  res.json(new ApiResponse("Password reset email sent successfully", 200));
});

const resetAdmissionPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    throw new ApiError("New password is required", 400);
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const application = await AdmissionApplication.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!application) {
    throw new ApiError("Invalid or expired reset token", 400);
  }

  application.password = newPassword;
  application.resetPasswordToken = null;
  application.resetPasswordExpires = null;

  await application.save();

  res.json(new ApiResponse("Password reset successful", 200));
});

const sendAdmissionEmailVerification = asyncHandler(async (req, res) => {

  const application = await AdmissionApplication.findById(req.user.id);

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  if (application.isEmailVerified) {
    throw new ApiError("Email already verified", 400);
  }
  const verificationToken = application.getVerificationToken();
  await application.save({ validateBeforeSave: false });
  const verifyUrl = `${process.env.FRONTEND_URL}/admission/verify-email/${verificationToken}`;
  await sendEmail({
    email: application.email,
    subject: "Verify Your Admission Email",
    message: `Click below to verify your email:\n\n${verifyUrl}\n\nValid for 15 minutes.`
  });

  res.json(
    new ApiResponse("Verification email sent successfully", 200)
  );

});

const verifyAdmissionEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const application = await AdmissionApplication.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: Date.now() }
  });

  if (!application) {
    throw new ApiError("Invalid or expired verification token", 400);
  }

  application.isEmailVerified = true;
  application.emailVerificationToken = null;
  application.emailVerificationTokenExpires = null;

  await application.save();

  res.json(new ApiResponse("Email verified successfully", 200));
});

const getApplicationsByInstituteAndBranch = asyncHandler(async (req, res) => {
  const { institutionId, branchId } = req.params;

  const applications = await AdmissionApplication.find({
    institutionId,
    branchId
  }).select("-password -resetPasswordToken -emailVerificationToken");

  if (!applications) {
    throw new ApiError("Application not found", 404);
  }

  res.json(
    new ApiResponse(
      "Applications fetched successfully",
      200,
      applications
    )
  );
});


const getApplicationsByInstitute = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;

  const applications = await AdmissionApplication.find({
    institutionId
  }).select("-password -resetPasswordToken -emailVerificationToken");

  if (!applications) {
    throw new ApiError("Application not found", 404);
  }

  res.json(
    new ApiResponse(
      "Applications fetched successfully",
      200,
      applications
    )
  );
});


const getApplicationById = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  const application = await AdmissionApplication.findById(applicationId)
    .select("-password -resetPasswordToken -emailVerificationToken");

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  res.json(
    new ApiResponse(
      "Application fetched successfully",
      200,
      application
    )
  );
});


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
  deleteAdmissionApplication,
  forgotAdmissionPassword,
  resetAdmissionPassword,
  sendAdmissionEmailVerification,
  verifyAdmissionEmail,
  getApplicationById,
  getApplicationsByInstitute,
  getApplicationsByInstituteAndBranch
};
