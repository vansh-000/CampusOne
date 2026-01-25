import { Router } from "express";
import { validateInstitutionJWT } from '../middlewares/institutionAuth.middleware.js';
import {
  createCourse,
  deleteCourse,
  findFacultiesByCourseAndBatch,
  findFacultiesByPrevCourseAndBatch,
  findFacultyByCourseId,
  findFacultyByPrevCourseId,
  findStudentByCourseId,
  findStudentByInstitutionCourse,
  findStudentByInstitutionPrevCourse,
  findStudentByPrevCourseId,
  getCourseById,
  getCourseByInstitution,
  getCoursesByDepartment,
  modifyStatus,
  updateCourse
} from "../controllers/course.controller.js";

const router = Router();

// Public Routes
router.get("/department/:departmentId", getCoursesByDepartment);
router.get("/institution/:institutionId", getCourseByInstitution);
router.get("/faculty/course/:courseId/department/:departmentId", findFacultyByCourseId);
router.get("/faculty/prev-course/:courseId/department/:departmentId", findFacultyByPrevCourseId);
router.get("/faculty/course/:courseId/department/:departmentId/batch/:batch", findFacultiesByCourseAndBatch);
router.get("/faculty/prev-course/:courseId/department/:departmentId/batch/:batch", findFacultiesByPrevCourseAndBatch);
router.get("/student/course/:courseId/department/:departmentId", findStudentByCourseId);
router.get("/student/prev-course/:courseId/department/:departmentId", findStudentByPrevCourseId);
router.get("/student/course/:courseId/institution/:institutionId", findStudentByInstitutionCourse);
router.get("/student/prev-course/:courseId/institution/:institutionId", findStudentByInstitutionPrevCourse);
router.get("/:courseId", getCourseById);

// Protected Routes
router.post("/create-course", validateInstitutionJWT, createCourse);
router.put("/:courseId", validateInstitutionJWT, updateCourse);
router.delete("/:courseId", validateInstitutionJWT, deleteCourse);
router.put("/change-status/:courseId", validateInstitutionJWT, modifyStatus);

export default router;