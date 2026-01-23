import { TimetableSlot } from "../models/timetable.model.js";
import { Faculty } from "../models/faculty.model.js";
import Course from "../models/course.model.js";
import { Student } from "../models/student.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import assertObjectId from "../utils/assertObjectId.js";

const overlap = (aStart, aEnd, bStart, bEnd) => {
    return aStart < bEnd && bStart < aEnd;
};

const createSlot = asyncHandler(async (req, res) => {
    const {
        institutionId,
        courseId,
        facultyId,
        batch,
        semester,
        dayOfWeek,
        startTime,
        endTime,
        room,
        type
    } = req.body;

    assertObjectId(institutionId);
    assertObjectId(courseId);
    assertObjectId(facultyId);

    if (startTime >= endTime) throw new ApiError("Invalid time range", 400);

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) throw new ApiError("Faculty not found", 404);

    const course = await Course.findById(courseId);
    if (!course) throw new ApiError("Course not found", 404);

    const teaches = faculty.courses.some(
        (c) =>
            c.courseId.toString() === courseId.toString() &&
            c.semester === semester &&
            c.batch === batch
    );

    if (!teaches) throw new ApiError("Faculty does not teach this course for this batch", 400);

    const slots = await TimetableSlot.find({
        institutionId,
        dayOfWeek
    });

    for (const s of slots) {
        if (overlap(startTime, endTime, s.startTime, s.endTime)) {
            if (s.facultyId.toString() === facultyId.toString()) {
                throw new ApiError("Faculty time clash detected", 409);
            }
            if (s.batch === batch && s.semester === semester) {
                throw new ApiError("Batch time clash detected", 409);
            }
            if (room && s.room === room) {
                throw new ApiError("Room is occupied at this time", 409);
            }
        }
    }

    const slot = await TimetableSlot.create({
        institutionId,
        courseId,
        facultyId,
        batch,
        semester,
        dayOfWeek,
        startTime,
        endTime,
        room,
        type
    });

    res.json(new ApiResponse("Timetable slot created", 201, slot));
});

const getFacultyTimetable = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;
    assertObjectId(facultyId);

    const slots = await TimetableSlot.find({ facultyId }).populate("courseId facultyId");

    res.json(new ApiResponse("Faculty timetable fetched", 200, slots));
});

const getStudentTimetable = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    assertObjectId(studentId);

    const student = await Student.findById(studentId);
    if (!student) throw new ApiError("Student not found", 404);

    const batch = `${student.branchId}-${student.admissionYear}`;

    const slots = await TimetableSlot.find({
        batch,
        semester: student.semester
    }).populate("courseId facultyId");

    res.json(new ApiResponse("Student timetable fetched", 200, slots));
});

const getInstitutionTimetable = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;
    assertObjectId(institutionId);

    const slots = await TimetableSlot.find({
        institutionId
    }).populate("courseId facultyId");

    res.json(new ApiResponse("Institution timetable fetched", 200, slots));
});

const updateSlot = asyncHandler(async (req, res) => {
    const { slotId } = req.params;
    assertObjectId(slotId);

    const updates = req.body;

    const slot = await TimetableSlot.findById(slotId);
    if (!slot) throw new ApiError("Slot not found", 404);
    const dayOfWeek = updates.dayOfWeek || slot.dayOfWeek;
    const facultyId = updates.facultyId || slot.facultyId;
    const batch = updates.batch || slot.batch;
    const semester = updates.semester || slot.semester;
    const startTime = updates.startTime || slot.startTime;
    const endTime = updates.endTime || slot.endTime;

    if (startTime >= endTime) {
        throw new ApiError("Invalid time range", 400);
    }
    const overlapQuery = {
        _id: { $ne: slotId },
        dayOfWeek,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    };
    const facultyClash = await TimetableSlot.findOne({
        ...overlapQuery,
        facultyId
    });

    if (facultyClash) {
        throw new ApiError("Faculty timetable clash detected", 400);
    }
    const batchClash = await TimetableSlot.findOne({
        ...overlapQuery,
        batch,
        semester
    });

    if (batchClash) {
        throw new ApiError("Batch timetable clash detected", 400);
    }
    const updated = await TimetableSlot.findByIdAndUpdate(slotId, updates, { new: true });

    res.json(new ApiResponse("Slot updated successfully", 200, updated));
});


const deleteSlot = asyncHandler(async (req, res) => {
    const { slotId } = req.params;
    assertObjectId(slotId);

    await TimetableSlot.findByIdAndDelete(slotId);

    res.json(new ApiResponse("Slot deleted", 200));
});

const clearInstitutionTimetable = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;
    assertObjectId(institutionId);

    const deleted = await TimetableSlot.deleteMany({ institutionId });

    res.json(new ApiResponse("Institution timetable cleared", 200, { deleted: deleted.deletedCount }));
});


export {
    createSlot,
    getFacultyTimetable,
    getStudentTimetable,
    getInstitutionTimetable,
    updateSlot,
    deleteSlot,
    clearInstitutionTimetable
};
