import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        if (!result.success) {
            const messages = (result.error?.issues || result.error?.errors || []).map(err => err.message).join(", ");
            return res.status(400).json({ error: messages || "Validation failed" });
        }
        next();
    } catch (e) {
        console.error(`Validation error on ${req.method} ${req.originalUrl}:`, e.message);
        return res.status(400).json({ error: "Validation failed" });
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

export const otpSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        phone: z.string().regex(/^\d{10}$/, "Invalid phone number").optional(),
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

export const applyJobSchema = z.object({
    params: z.object({
        jobId: z.string().min(1, "Job ID is required"),
    }),
    body: z.object({
        coverNote: z.string().max(500).optional(),
    })
});

export const updateStatusSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Application ID is required"),
    }),
    body: z.object({
        status: z.enum(["pending", "viewed", "shortlisted", "rejected", "hired", "employment-ended"],
            { errorMap: () => ({ message: "Invalid status value" }) }),
    })
});

export const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        dob: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        bio: z.string().max(500).optional(),
        skills: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        designation: z.string().optional(),
        isHiringManager: z.boolean().optional(),
        expectedSalary: z.object({
            min: z.number().optional(),
            max: z.number().optional(),
            type: z.enum(["monthly", "daily"]).optional(),
        }).optional(),
        documents: z.record(z.string(), z.unknown()).optional(),
    })
});

export const workExperienceSchema = z.object({
    body: z.object({
        role: z.string().min(1, "Role is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().optional(),
        companyName: z.string().optional(),
        company: z.string().optional(),
        department: z.string().optional(),
        description: z.string().max(1000).optional(),
        skills: z.array(z.string()).optional(),
        isCurrent: z.boolean().optional(),
    })
});

