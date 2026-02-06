import express from "express";
import { sendOTP, verifyOTP, register, login, forgotPassword, resetPassword, logout } from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
export default router;