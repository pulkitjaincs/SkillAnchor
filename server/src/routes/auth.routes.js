import express from "express";
import { sendOTP, verifyOTP, register, login } from "../controllers/auth.controllers.js";

const router = express.Router();
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", register);
router.post("/login", login);

export default router;