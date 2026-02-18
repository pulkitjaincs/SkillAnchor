import express from "express";
import { sendOTP, verifyOTP, register, login, forgotPassword, resetPassword, logout, updatePassword, sendUpdateOTP, verifyUpdateOTP } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate, registerSchema, loginSchema, otpSchema, verifyOTPSchema, forgotPasswordSchema, resetPasswordSchema, updatePasswordSchema } from "../middleware/validate.js";

const router = express.Router();
router.post("/send-otp", validate(otpSchema), sendOTP);
router.post("/verify-otp", validate(verifyOTPSchema), verifyOTP);
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/logout", logout);

router.post("/update-password", protect, validate(updatePasswordSchema), updatePassword);

router.post("/send-update-otp", protect, sendUpdateOTP);
router.post("/verify-update-otp", protect, verifyUpdateOTP);

export default router;