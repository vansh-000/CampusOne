import { asyncHandler } from "../utils/asyncHandler.js";
import { AttendanceRecord } from "../models/attendenceRecord.model.js";
import { AttendanceSession } from "../models/attendenceSession.model.js";
import { Student } from "../models/student.model.js";
import assertObjectId from "../utils/assertObjectId.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const markAttendance = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  assertObjectId(sessionId);

  const { records } = req.body;

  const session = await AttendanceSession.findById(sessionId);
  if (!session) throw new ApiError("Session not found", 404);
  const students = await Student.find({
    semester: session.semester,
  }).select("_id");

  const validIds = new Set(students.map(s => s._id.toString()));

  for (const r of records) {
    if (!validIds.has(r.studentId)) {
      throw new ApiError("Student not in batch/semester", 400);
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
  const { batch, semester, courseId } = req.query;

  const students = await Student.find({ semester }).select("_id");

  const studentIds = students.map(s => s._id);

  const records = await AttendanceRecord.aggregate([
    { $match: { studentId: { $in: studentIds }, courseId: new mongoose.Types.ObjectId(courseId) } },
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

  res.json(new ApiResponse("Defaulters fetched", 200, records));
});

const studentFullReport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

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

  res.json(new ApiResponse("Student full attendance report", 200, report));
});

export {
  markAttendance,
  studentCourseAttendance,
  batchDefaulters,
  studentFullReport
};
