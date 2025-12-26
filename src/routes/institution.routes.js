import { Router } from "express";
import {
    registerInstitution,
    loginInstitution,
    logoutInstitution,
    getCurrentInstitution,
    forgotInstitutionPassword,
    resetInstitutionPassword,
    sendInstitutionEmailVerification,
    verifyInstitutionEmail,
    updateInstitutionAvatar,
} from "../controllers/institution.controller.js";

import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// PUBLIC ROUTES

router.post("/register", registerInstitution);
router.post("/login", loginInstitution);
router.post("/forgot-password", forgotInstitutionPassword);
router.post("/reset-password/:token", resetInstitutionPassword);
router.get("/verify-email/:token", verifyInstitutionEmail);

// PROTECTED ROUTES
router.get("/current-institution", validateInstitutionJWT, getCurrentInstitution);
router.post("/logout", validateInstitutionJWT, logoutInstitution);
router.post(
    "/send-email-verification",
    validateInstitutionJWT,
    sendInstitutionEmailVerification
);
router.post(
    "/update-avatar",
    validateInstitutionJWT,
    upload.single("avatar"),
    updateInstitutionAvatar
);

export default router;
