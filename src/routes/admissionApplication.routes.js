import express from "express";
import {
    registerAdmissionApplication,
    loginAdmissionApplication,
    logoutAdmissionApplication,
    refreshAdmissionAccessToken,
    getCurrentAdmissionApplication,
    getApplicationStatusByNumber,
    updateAdmissionApplication,
    updateAdmissionApplicationStatus,
    addAdmissionReviewLog,
    deleteAdmissionApplication,
    forgotAdmissionPassword,
    resetAdmissionPassword,
    sendAdmissionEmailVerification,
    verifyAdmissionEmail,
    getApplicationById,
    getApplicationsByInstituteAndBranch,
    getApplicationsByInstitute
} from "../controllers/admissionApplication.controller.js";
import { validateAdmissionJWT } from "../middlewares/admissionAuth.middleware.js";
import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";


const router = express.Router();

router.post("/register", registerAdmissionApplication);
router.post("/login", loginAdmissionApplication);
router.get(
    "/status/:applicationNumber",
    validateAdmissionJWT,
    getApplicationStatusByNumber
);
router.post("/forgot-password", forgotAdmissionPassword);
router.post("/reset-password/:token", resetAdmissionPassword);
router.get("/verify-email/:token", verifyAdmissionEmail);
router.post("/logout", logoutAdmissionApplication);
router.post("/refresh-token", refreshAdmissionAccessToken);
router.get(
    "/me",
    validateAdmissionJWT,
    getCurrentAdmissionApplication
);
router.put(
    "/me",
    validateAdmissionJWT,
    updateAdmissionApplication
);
router.post(
    "/send-verification-email",
    validateAdmissionJWT,
    sendAdmissionEmailVerification
);
router.put(
    "/:applicationId/status",
    validateInstitutionJWT,
    updateAdmissionApplicationStatus
);
router.post(
    "/:applicationId/review-log",
    validateInstitutionJWT,
    addAdmissionReviewLog
);router.get(
  "/institution/:institutionId",
  validateInstitutionJWT,
  getApplicationsByInstitute
);
router.get(
  "/institution/:institutionId/branch/:branchId",
  validateInstitutionJWT,
  getApplicationsByInstituteAndBranch
);
router.get(
  "/:applicationId",
  validateInstitutionJWT,
  getApplicationById
);
router.delete(
    "/:applicationId",
    validateInstitutionJWT,
    deleteAdmissionApplication
);

export default router;
