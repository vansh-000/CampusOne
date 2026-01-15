import Student from "../models/student.model.js";
import { User } from "../models/user.model.js";

export const registerStudentService = async (payload) => {
  const {
    name,
    email,
    phone,
    password,
    institutionId,
    departmentId,
    enrollmentNumber,
    courseIds,
    semester,
    admissionYear,
    hostelStatus,
    guardianDetails,
  } = payload;

  if (
    !name || !email || !phone || !password ||
    !institutionId || !departmentId || !enrollmentNumber ||
    !semester || !admissionYear
  ) {
    throw new Error("Required fields missing");
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) throw new Error("Email in use");

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) throw new Error("Phone in use");

  let user;

  try {
    user = await User.create({
      name,
      email,
      phone,
      password,
      role: "Student",
      avatar: process.env.BACKEND_URL + "/user.png",
    });

    await Student.create({
      userId: user._id,
      institutionId,
      departmentId,
      enrollmentNumber,
      courseIds: courseIds ? courseIds.split(",") : [],
      semester,
      admissionYear,
      hostelStatus: hostelStatus ?? false,
      guardianDetails: guardianDetails ? JSON.parse(guardianDetails) : {},
    });

  } catch (err) {
    if (user) await User.deleteOne({ _id: user._id });

    throw err;
  }
};
