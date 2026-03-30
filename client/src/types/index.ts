export interface Company {
    name: string;
    logo?: string;
}

export interface Job {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    subcategory?: string;
    city: string;
    state: string;
    locality?: string;
    jobType?: 'full-time'|'part-time'|'contract'|'temporary'|'internship'|'other';
    shift?: 'day' | 'night' | 'flexible';
    gender?: 'male' | 'female' | 'any';
    experienceMin?: number;
    experienceMax?: number;
    salaryMin: number;
    salaryMax?: number;
    salaryType?: 'hourly'|'daily'|'weekly'|'monthly'|'yearly';
    createdAt: string;
    skills?: string[];
    company?: Company;
    vacancies?: number;
    benefits?: string[];
    status?: 'active' | 'inactive' | 'closed' | 'paused';
    applicationsCount?: number;
}

export interface User {
    _id: string;
    name: string;
    email?: string;
    role: 'worker' | 'employer';
    avatar?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface AuthPayloads {
    Login: {
        authType: 'email' | 'phone';
        email?: string;
        phone?: string;
        password?: string;
        otp?: string;
    };
    Register: {
        name: string;
        role: 'worker' | 'employer';
        authType: 'email' | 'phone';
        email?: string;
        phone?: string;
        password?: string;
    };
    SendOTP: {
        authType: 'email' | 'phone';
        email?: string;
        phone?: string;
        reason?: string;
        role?: 'worker' | 'employer';
        name?: string;
    };
    VerifyOTP: {
        authType: 'email' | 'phone';
        email?: string;
        phone?: string;
        otp: string;
        reason?: string;
        role?: 'worker' | 'employer';
        name?: string;
        password?: string;
    };
    ForgotPassword: { email: string } | { phone: string };
    ResetPassword: { email: string; otp: string; newPassword?: string } | { phone: string; otp: string; newPassword?: string };
    UpdatePassword: { currentPassword?: string; newPassword?: string };
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired' | 'employment-ended';

export interface Application {
    _id: string;
    job: Job;
    jobseeker: User;
    applicant?: {
        _id?: string;
        name?: string;
        phone?: string;
        email?: string;
        avatarUrl?: string;
    };
    status: ApplicationStatus;
    coverNote?: string;
    createdAt: string;
    appliedAt?: string;
}

export interface PaginatedJobsResponse {
    jobs: Job[];
    hasMore: boolean;
    total?: number;
}

export interface PaginatedApplicationsResponse {
    applications: Application[];
    hasMore: boolean;
    total?: number;
}

export interface WorkExperience {
    _id: string;
    role?: string;
    companyName?: string;
    company?: { name: string };
    startDate: string;
    endDate?: string | null;
    isCurrent?: boolean;
    description?: string;
    isVisible?: boolean;
    isVerified?: boolean;
    title?: string;
    location?: string;
    current?: boolean;
}

interface Document {
    number?: string;
    verified?: boolean;
}

export interface Profile {
    _id: string;
    user?: User;
    name: string;
    avatar?: string;
    avatarUrl?: string;
    city?: string;
    state?: string;
    bio?: string;
    skills?: string[];
    languages?: string[];
    workHistory?: WorkExperience[];
    totalExperienceYears?: number;
    completionPercent?: number;
    role?: 'worker' | 'employer';
    phone?: string;
    email?: string;
    whatsapp?: string;
    dob?: string;
    gender?: string;
    designation?: string;
    pincode?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    isHiringManager?: boolean;
    isAvatarHidden?: boolean;
    expectedSalary?: {
        min?: number;
        max?: number;
        type?: 'monthly' | 'daily';
    };
    company?: {
        name?: string;
        logo?: string;
        website?: string;
    };
    documents?: {
        aadhaar?: Document;
        pan?: Document;
        license?: Document;
    };
}
