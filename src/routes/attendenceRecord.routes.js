import { Router } from "express";

import {
    markAttendance,
    studentCourseAttendance,
    batchDefaulters,
    studentFullReport
} from "../controllers/attendenceRecord.controller.js";

const router = Router();

router.post("/record/:sessionId/mark", markAttendance);
router.get("/record/student/:studentId/course/:courseId", studentCourseAttendance);
router.get("/record/batch/defaulters", batchDefaulters);
router.get("/record/student/:studentId/report", studentFullReport);

export default router;
