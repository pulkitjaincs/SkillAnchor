import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: false,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    },
});

import { logger } from "./logger.js";

export const sendEmailOTP = async (to: string, body: string) => {
    try {
        await transporter.sendMail({
            from: `"SkillAnchor" <${env.EMAIL_USER}>`,
            to: to,
            subject: "Your SkillAnchor OTP",
            text: body,
        });
    } catch (error) {
        logger.error({ error }, "Nodemailer Error");
        throw new Error("Failed to send OTP email.");
    }
};
