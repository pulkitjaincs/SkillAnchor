import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmailOTP = async (to, body) => {
    try {
        await transporter.sendMail({
            from: `"SkillAnchor" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: "Your SkillAnchor OTP is ",
            text: body,
        });
    } catch (error) {
        console.error("Nodemailer Error:", error);
        throw new Error("Failed to send OTP email.");
    }
};
