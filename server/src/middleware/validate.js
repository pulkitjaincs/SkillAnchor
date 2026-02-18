import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e) {
        return res.status(400).json({ error: e.errors.map(err => err.message).join(", ") });
    }
};

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        role: z.enum(["worker", "employer"], { errorMap: () => ({ message: "Role must be worker or employer" }) }),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        phone: z.string().regex(/^\d{10}$/, "Invalid phone number").optional(),
        password: z.string().min(8, "Password must be at least 8 characters"),
    }).refine(data => data.email || data.phone, "Email or Phone is required")
});

export const verifyOTPSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        phone: z.string().regex(/^\d{10}$/, "Invalid phone number").optional(),
        otp: z.string().length(6, "OTP must be 6 digits"),
        name: z.string().optional(),
        role: z.enum(["worker", "employer"]).optional(),
    }).refine(data => data.email || data.phone, "Email or Phone is required")
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        phone: z.string().regex(/^\d{10}$/, "Invalid phone number").optional(),
    }).refine(data => data.email || data.phone, "Email or Phone is required")
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        phone: z.string().regex(/^\d{10}$/, "Invalid phone number").optional(),
        otp: z.string().length(6, "OTP must be 6 digits"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
    }).refine(data => data.email || data.phone, "Email or Phone is required")
});

export const updatePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
    })
});

export const createJobSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title too short"),
        description: z.string().min(10, "Description too short"),
        category: z.string(),
        city: z.string(),
        state: z.string(),
        salaryMin: z.number().min(0),
        salaryType: z.enum(["monthly", "daily", "hourly"]),
        jobType: z.enum(["full-time", "part-time", "contract"]),
        vacancies: z.number().optional(),
    })
});
