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
    jobType?: string;
    experienceMin?: number;
    salaryMin: number;
    salaryMax?: number;
    salaryType?: string;
    createdAt: string;
    skills?: string[];
    company?: Company;
}

export interface User {
    id: string;
    name: string;
    email?: string;
    role: 'worker' | 'employer';
    avatar?: string;
}
