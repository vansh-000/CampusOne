import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AttendanceRecord } from "../models/attendenceRecord.model.js";
import { AttendanceSession } from "../models/attendenceSession.model.js";
import { Student } from "../models/student.model.js";
import { Branch } from "../models/branch.model.js";
import assertObjectId from "../utils/assertObjectId.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const computeBatch = async (student) => {
  const branch = await Branch.findById(student.branchId).select("code");
  if (!branch) throw new ApiError("Branch not found", 400);
  return `${branch.code}-${student.admissionYear}`;
};

const markAttendance = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  assertObjectId(sessionId);

  const { records } = req.body;

  const session = await AttendanceSession.findById(sessionId);
  if (!session) throw new ApiError("Session not found", 404);

  const allStudents = await Student.find({}).select("_id branchId admissionYear");
  const validStudents = [];

  for (const s of allStudents) {
    const batch = await computeBatch(s);
    if (batch === session.batch) validStudents.push(s._id.toString());
  }

  for (const r of records) {
    if (!validStudents.includes(r.studentId)) {
      throw new ApiError("Student not in this batch", 400);
    }
  }

  await Promise.all(
    records.map(r =>
      AttendanceRecord.updateOne(
        { sessionId, studentId: r.studentId },
        {
          $set: {
            status: r.status,
            timestamp: Date.now(),
            courseId: session.courseId,
            markedBy: session.facultyId
          }
        },
        { upsert: true }
      )
    )
  );

  await AttendanceSession.findByIdAndUpdate(sessionId, { status: "conducted" });

  res.json(new ApiResponse("Attendance marked", 200));
});

const studentCourseAttendance = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.params;
  assertObjectId(studentId);
  assertObjectId(courseId);

  const result = await AttendanceRecord.aggregate([
    { $match: { studentId: new mongoose.Types.ObjectId(studentId), courseId: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ["$status", "P"] }, 1, 0] } }
      }
    }
  ]);

  const { total = 0, present = 0 } = result[0] || {};
  const percentage = total ? (present / total) * 100 : 0;

  res.json(new ApiResponse("Attendance percentage", 200, { total, present, percentage }));
});

const batchDefaulters = asyncHandler(async (req, res) => {
  const { batch, courseId } = req.query;
  assertObjectId(courseId);

  const allStudents = await Student.find({}).select("_id branchId admissionYear");

  const batchStudents = [];
  for (const s of allStudents) {
    const b = await computeBatch(s);
    if (b === batch) batchStudents.push(s._id);
  }

  const stats = await AttendanceRecord.aggregate([
    { $match: { studentId: { $in: batchStudents }, courseId: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: "$studentId",
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ["$status", "P"] }, 1, 0] } }
      }
    },
    {
      $project: {
        percentage: {
          $cond: [{ $eq: ["$total", 0] }, 0, { $multiply: [{ $divide: ["$present", "$total"] }, 100] }]
        }
      }
    },
    { $match: { percentage: { $lt: 75 } } }
  ]);

  res.json(new ApiResponse("Batch defaulters", 200, stats));
});

const studentFullReport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  assertObjectId(studentId);

  const report = await AttendanceRecord.aggregate([
    { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: "$courseId",
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ["$status", "P"] }, 1, 0] } }
      }
    }
  ]);

  res.json(new ApiResponse("Student full report", 200, report));
});

const batchCourseMatrix = asyncHandler(async (req, res) => {
  const { batch, courseId } = req.query;
  assertObjectId(courseId);

  const allStudents = await Student.find({}).select("_id name branchId admissionYear");

  const students = [];
  for (const s of allStudents) {
    const b = await computeBatch(s);
    if (b === batch) students.push(s);
  }

  const sessions = await AttendanceSession.find({ batch, courseId })
    .select("_id date startTime endTime")
    .sort({ date: 1, startTime: 1 });

  const sessionIds = sessions.map(s => s._id);

  const records = await AttendanceRecord.find({ sessionId: { $in: sessionIds } })
    .select("sessionId studentId status");

  const matrix = sessions.map(session => {
    const row = {
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime
    };

    students.forEach(st => {
      const rec = records.find(r => r.sessionId.equals(session._id) && r.studentId.equals(st._id));
      row[st.name] = rec ? rec.status : "-";
    });

    return row;
  });

  res.json(new ApiResponse("Batch course matrix", 200, { students, sessions: matrix }));
});

const studentCourseDatewise = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.params;
  assertObjectId(studentId);
  assertObjectId(courseId);

  const records = await AttendanceRecord.find({ studentId, courseId })
    .populate({ path: "sessionId", select: "date startTime endTime" })
    .sort({ "sessionId.date": 1, "sessionId.startTime": 1 });

  res.json(new ApiResponse("Student course datewise", 200, records));
});

const sessionSlotAttendance = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  assertObjectId(sessionId);

  const records = await AttendanceRecord.find({ sessionId })
    .populate("studentId", "name enrollmentNumber")
    .sort({ status: 1 });

  const session = await AttendanceSession.findById(sessionId)
    .populate("courseId facultyId");

  res.json(new ApiResponse("Session log", 200, { session, records }));
});


export {
  markAttendance,
  studentCourseAttendance,
  batchDefaulters,
  studentFullReport,
  batchCourseMatrix,
  studentCourseDatewise,
  sessionSlotAttendance
};
