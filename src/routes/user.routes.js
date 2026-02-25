import { Router } from "express";
import { validateUserJWT } from "../middlewares/userAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    forgotUserPassword,
    resetUserPassword,
    sendUserEmailVerification,
    verifyUserEmail,
    updateUserAvatar,
    updateUser,
    getFacultyByUserId,
    deleteUser,
    refreshAccessToken,
} from "../controllers/user.controller.js";
import { validateInstitutionJWT } from "../middlewares/institutionAuth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// PUBLIC ROUTES
router.post("/register", validateInstitutionJWT, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotUserPassword);
router.post("/reset-password/:token", resetUserPassword);
router.get("/verify-email/:token", verifyUserEmail);

// PROTECTED ROUTES
router.delete("/delete/:userId", validateInstitutionJWT, deleteUser);
router.get("/current-user", validateUserJWT, getCurrentUser);
router.post("/logout", validateUserJWT, logoutUser);
router.post(
    "/send-email-verification",
    validateUserJWT,
    sendUserEmailVerification
);
router.post(
    "/update-avatar",
    validateUserJWT,
    upload.single("avatar"),
    updateUserAvatar
);
router.put(
    "/update",
    validateUserJWT,
    updateUser
);
router.get(
    "/faculty",
    validateUserJWT,
    getFacultyByUserId
);

export default router;