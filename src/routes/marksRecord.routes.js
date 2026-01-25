import { Router } from "express";
import {
    getBatchCourseComponents,
    getBatchCourseMatrix,
    getStudentCourseDetail,
    getStudentMarksLine,
    recordMarks
} from "../controllers/marksRecord.controllers.js";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";

const router = Router();

router.post("/record", validateUserJWT, recordMarks);
router.get("/course/:courseId/components", validateUserJWT, getBatchCourseComponents);
router.get("/matrix", validateUserJWT, getBatchCourseMatrix);
router.get("/student/:studentId/all", validateUserJWT, getStudentMarksLine);
router.get("/student/:studentId/course/:courseId", validateUserJWT, getStudentCourseDetail);

export default router;
