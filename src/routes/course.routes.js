import { Router } from "express";
import { validateInstitutionJWT } from '../middlewares/institutionAuth.middleware.js';
import {
    createCourse,
    deleteCourse,
    getCourseById,
    getCoursesByDepartment,
    updateCourse
} from "../controllers/course.controller.js";


const router = Router();

// Public Routes
router.get("/department/:departmentId", getCoursesByDepartment);
router.get("/:courseId", getCourseById);

// Protected Routes
router.post("/", validateInstitutionJWT, createCourse);
router.put("/:courseId", validateInstitutionJWT, updateCourse);
router.delete("/:courseId", validateInstitutionJWT, deleteCourse);

export default router;