import { Router } from "express";
import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import {
    checkDepartmentCodeExists,
    createDepartment,
    deleteDepartment,
    getDepartmentById,
    getDepartmentsByInstitution,
    updateDepartment
} from "../controllers/department.controller.js";

const router = Router();

//public routes
router.get("/institution/:institutionId", getDepartmentsByInstitution);
router.get("/:departmentId", getDepartmentById);
router.get("/code-exists", validateInstitutionJWT, checkDepartmentCodeExists);

//protected routes
router.post("/create-department", validateInstitutionJWT, createDepartment);
router.put("/update-department/:departmentId", validateInstitutionJWT, updateDepartment);
router.delete("/delete-department/:departmentId", validateInstitutionJWT, deleteDepartment);

export default router;