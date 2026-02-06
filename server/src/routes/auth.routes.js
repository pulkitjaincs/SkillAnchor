import express from "express";
import { sendOTP, verifyOTP, register, login, forgotPassword, resetPassword, logout, updatePassword, sendUpdateOTP, verifyUpdateOTP } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

router.post("/update-password", protect, updatePassword);
router.post("/send-update-otp", protect, sendUpdateOTP);
router.post("/verify-update-otp", protect, verifyUpdateOTP);

export default router;