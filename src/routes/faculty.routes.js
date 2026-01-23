import { Router } from "express";
import {
    addFacultyCourse,
    createFaculty,
    deleteFaculty,
    deleteFacultyCourse,
    editFaculty,
    finishFacultyCourse,
    getFacultiesByDepartment,
    getFacultiesByInstitution,
    getFacultyById,
    modifyActiveStatus,
    toggleFacultyInCharge,
    updateFacultyDepartment
} from "../controllers/faculty.controller.js";

import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";

const router = Router();

// Public Routes
router.get("/:facultyId", getFacultyById);

// Protected Routes
router.post("/create-faculty", validateInstitutionJWT, createFaculty);
router.put("/edit-faculty/:facultyId", validateInstitutionJWT, editFaculty);
router.put("/edit-facultyById/:facultyId", validateUserJWT, editFaculty);
router.get("/institution/:institutionId", validateInstitutionJWT, getFacultiesByInstitution);
router.get("/department/:departmentId", validateInstitutionJWT, getFacultiesByDepartment);
router.delete("/delete-faculty/:facultyId", validateInstitutionJWT, deleteFaculty);
router.put("/update-department/:facultyId", validateInstitutionJWT, updateFacultyDepartment);
router.put("/add-courses/faculty/:facultyId", validateInstitutionJWT, addFacultyCourse);
router.put("/add-coursesById/faculty/:facultyId", validateUserJWT, addFacultyCourse);
router.put("/delete-courses/faculty/:facultyId/course/:courseId", validateInstitutionJWT, deleteFacultyCourse);
router.put("/delete-coursesById/faculty/:facultyId/course/:courseId", validateUserJWT, deleteFacultyCourse);
router.put("/toggle-in-charge/:facultyId", validateInstitutionJWT, toggleFacultyInCharge);
router.put("/finish-course-by-user/:facultyId/:courseId", validateUserJWT, finishFacultyCourse);
router.put("/finish-course-by-faculty/:facultyId/:courseId", validateInstitutionJWT, finishFacultyCourse);
router.put("/change-status/:facultyId", validateInstitutionJWT, modifyActiveStatus);

export default router;
