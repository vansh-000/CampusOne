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
} from "../controllers/user.controller.js";

const router = Router();

// PUBLIC ROUTES
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotUserPassword);
router.post("/reset-password/:token", resetUserPassword);
router.get("/verify-email/:token", verifyUserEmail);

// PROTECTED ROUTES
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

export default router;