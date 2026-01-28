import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Student } from "../models/student.model.js";
import { MarksRecord } from "../models/marksRecord.model.js";
import Course from "../models/course.model.js";

const assertObjectId = (id, field = "id") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(`Invalid ${field}`, 400);
    }
};

/* 
|--------------------------------------------------------------------------
| 1. recordMarks  (Faculty)
| Bulk entry of marks for a batch + course + component
| Input format:
| {
|   courseId,
|   batch: "CSE-2023",
|   component: "CT1",
|   marks: [{ studentId, marks, semester }]
| }
|--------------------------------------------------------------------------
*/
const recordMarks = asyncHandler(async (req, res) => {
    const { courseId, batch, component, marks } = req.body;

    assertObjectId(courseId);

    if (!batch || !component) {
        throw new ApiError("batch and component are required", 400);
    }

    if (!Array.isArray(marks) || marks.length === 0) {
        throw new ApiError("marks[] must be a non-empty array", 400);
    }

    const course = await Course.findById(courseId).lean();
    if (!course) throw new ApiError("Course not found", 404);

    const comp = course.components.find(c => c.name === component);
    if (!comp) throw new ApiError("Invalid component for this course", 400);

    const bulkOps = marks.map(m => ({
        updateOne: {
            filter: {
                studentId: m.studentId,
                courseId,
                component
            },
            update: {
                $set: {
                    marks: m.marks,
                    maxMarks: comp.maxMarks,
                    batch,
                    facultyId: req.user.facultyId,
                    semester: m.semester,
                    timestamp: Date.now()
                }
            },
            upsert: true
        }
    }));

    await MarksRecord.bulkWrite(bulkOps);
    res.json(new ApiResponse("Marks recorded successfully", 200));
});


/*
|--------------------------------------------------------------------------
| 2. getBatchCourseComponents
| Used to show the course Mark structure (CT1, CT2, MID, END, LAB...)
| UI uses it before marks entry or matrix view
|--------------------------------------------------------------------------
*/
const getBatchCourseComponents = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    assertObjectId(courseId, "courseId");

    const course = await Course.findById(courseId, "name code components evaluationScheme");
    if (!course) throw new ApiError("Course not found", 404);

    res.json(new ApiResponse("Course components fetched", 200, course));
});


/*
|--------------------------------------------------------------------------
| 3. getBatchCourseMatrix
| Matrix View (HOD/Admin/Faculty)
|--------------------------------------------------------------------------
| Example Output:
| [
|   { name:"Raj", CT1: 12, CT2: 14, END: 45 },
|   { name:"Sneha", CT1: 15, CT2: "-", END: 40 }
| ]
|--------------------------------------------------------------------------
*/
const getBatchCourseMatrix = asyncHandler(async (req, res) => {
    const { batch, courseId } = req.query;
    assertObjectId(courseId);

    if (!batch) throw new ApiError("batch required", 400);

    const course = await Course.findById(courseId).lean();
    if (!course) throw new ApiError("Course not found", 404);

    const components = course.components.map(c => c.name);

    const [branch, year] = batch.split("-");
    const students = await Student.find({ admissionYear: year })
        .select("_id name enrollmentNumber")
        .sort({ name: 1 })
        .lean();

    const studentIds = students.map(s => s._id);

    const records = await MarksRecord.find({
        batch,
        courseId,
        studentId: { $in: studentIds }
    }).lean();

    const matrix = students.map(s => {
        const row = {
            student: s.name,
            enrollmentNumber: s.enrollmentNumber
        };
        components.forEach(c => {
            const rec = records.find(
                r => r.studentId.toString() === s._id.toString() && r.component === c
            );
            row[c] = rec ? rec.marks : "-";
        });
        return row;
    });

    res.json(
        new ApiResponse("Marks matrix fetched", 200, { components, matrix })
    );
});


/*
|--------------------------------------------------------------------------
| 4. getStudentMarksLine
| Used for: Student Dashboard (Self-view)
| Shows marks of all enrolled active courses:
| {
|   "DBMS": { CT1: 12, CT2: 13, END: 45 },
|   "CN":   { CT1: 15, END: 41 }
| }
|--------------------------------------------------------------------------
*/
const getStudentMarksLine = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    assertObjectId(studentId);

    const records = await MarksRecord.find({ studentId })
        .populate("courseId", "name code")
        .lean();

    const result = {};

    for (const r of records) {
        const cname = r.courseId.name;
        if (!result[cname]) result[cname] = {};
        result[cname][r.component] = r.marks;
    }

    res.json(
        new ApiResponse("Student marks across courses fetched", 200, result)
    );
});


/*
|--------------------------------------------------------------------------
| 5. getStudentCourseDetail
| Shows detailed marks for a specific course:
|--------------------------------------------------------------------------
| UI Use-case:
| Student opens → DBMS → sees:
| CT1: 12/20
| CT2: 13/20
| END: 45/70
|--------------------------------------------------------------------------
*/
const getStudentCourseDetail = asyncHandler(async (req, res) => {
    const { studentId, courseId } = req.params;
    assertObjectId(studentId);
    assertObjectId(courseId);

    const course = await Course.findById(courseId, "name code components").lean();
    if (!course) throw new ApiError("Course not found", 404);

    const components = course.components.map(c => c.name);

    const records = await MarksRecord.find({
        studentId,
        courseId
    })
        .sort({ timestamp: 1 })
        .lean();

    const detail = {};
    components.forEach(c => {
        const rec = records.find(r => r.component === c);
        detail[c] = rec ? `${rec.marks}/${rec.maxMarks}` : "-";
    });

    res.json(new ApiResponse("Student course marks detail", 200, detail));
});

export {
    getStudentCourseDetail,
    getBatchCourseComponents,
    recordMarks,
    getBatchCourseMatrix,
    getStudentMarksLine
}