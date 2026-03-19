/**
 * Shared TypeScript interfaces for the SkillAnchor application.
 */

export interface Company {
    name: string;
    logo?: string;
}

export interface Job {
    _id: string;
    title: string;
    description?: string;
    city: string;
    state: string;
    jobType?: 'full-time'|'part-time'|'contract'|'temporary'|'internship'|'other';
    experienceMin?: number;
    salaryMin: number;
    salaryMax?: number;
    salaryType?: 'hourly'|'daily'|'weekly'|'monthly'|'yearly';
    createdAt: string;
    skills?: string[];
    company?: Company;
    vacancies?:number;
    benefits?:string[];
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

export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';

export interface Application {
    _id: string;
    job: Job;
    jobseeker: User;
    status: ApplicationStatus;
    coverNote?: string;
    createdAt: string;
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
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
    isVisible: boolean;
}

export interface Profile {
    _id: string;
    user: User;
    name: string;
    avatar?: string;
    city?: string;
    state?: string;
    bio?: string;
    skills?: string[];
    languages?: string[];
    workHistory?: WorkExperience[];
    totalExperienceYears?: number;
    completionPercent?: number;
}
