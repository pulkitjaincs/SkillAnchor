import axios from "axios";
import { Job, User, Application, ApiResponse, PaginatedJobsResponse, PaginatedApplicationsResponse, Profile, WorkExperience } from "@/types";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined' && error.response?.status === 401) {
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);
export const authAPI = {
    sendOTP: (data: Record<string, unknown>) => api.post('/auth/send-otp', data),
    verifyOTP: (data: Record<string, unknown>) => api.post('/auth/verify-otp', data),
    register: (data: Record<string, unknown>) => api.post('/auth/register', data),
    login: (data: Record<string, unknown>) => api.post('/auth/login', data),
    forgotPassword: (data: Record<string, unknown>) => api.post('/auth/forgot-password', data),
    resetPassword: (data: Record<string, unknown>) => api.post('/auth/reset-password', data),
    logout: () => api.post('/auth/logout'),
    updatePassword: (data: Record<string, unknown>) => api.post('/auth/update-password', data),
    sendUpdateOTP: (data: Record<string, unknown>) => api.post('/auth/send-update-otp', data),
    verifyUpdateOTP: (data: Record<string, unknown>) => api.post('/auth/verify-update-otp', data),
    getMe: () => api.get<{ success: boolean; user: User }>('/auth/get-me')
};

// Jobs API
export const jobsAPI = {
    getAll: (params?: Record<string, unknown>) => api.get<PaginatedJobsResponse>('/jobs', { params }),
    getById: (id: string) => api.get<ApiResponse<{ job: Job }>>(`/jobs/${id}`),
    getMyJobs: (params?: Record<string, unknown>) => api.get<PaginatedJobsResponse>('/jobs/my-jobs', { params }),
    create: (data: Partial<Job>) => api.post<ApiResponse<{ job: Job }>>('/jobs', data),
    update: (id: string, data: Partial<Job>) => api.put<ApiResponse<{ job: Job }>>(`/jobs/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse<{ job: Job }>>(`/jobs/${id}`)
};

// Applications API
export const applicationsAPI = {
    apply: (jobId: string, data: { coverNote?: string }) => api.post<ApiResponse<{ application: Application }>>(`/applications/apply/${jobId}`, data),
    getMyApplications: (params?: Record<string, unknown>) => api.get<PaginatedApplicationsResponse>('/applications/my-applications', { params }),
    getJobApplicants: (jobId: string, params?: Record<string, unknown>) => api.get<PaginatedApplicationsResponse>(`/applications/job/${jobId}`, { params }),
    updateStatus: (id: string, status: string) => api.patch<ApiResponse<{ application: Application }>>(`/applications/${id}/status`, { status }),
    withdraw: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/applications/${id}`)
};

// Profile API
export const profileAPI = {
    getMyProfile: () => api.get<ApiResponse<{ profile: Profile }>>('/profile/my-profile'),
    updateMyProfile: (data: Partial<Profile>) => api.put<ApiResponse<{ profile: Profile }>>('/profile/my-profile', data),
    getByUserId: (userId: string) => api.get<ApiResponse<{ profile: Profile }>>(`/profile/user/${userId}`),
    getMyTeam: (params?: Record<string, unknown>) => api.get<ApiResponse<{ profiles: Profile[] }>>('/profile/my-team', { params }),
    updateAvatarUrl: (avatarKey: string) => api.patch<ApiResponse<{ profile: Profile }>>('/profile/update-avatar-url', { avatarKey })
};

// Work Experience API
export const workExperienceAPI = {
    getByUser: (userId: string) => api.get<ApiResponse<{ workExperiences: WorkExperience[] }>>(`/work-experience/user/${userId}`),
    create: (data: Partial<WorkExperience>) => api.post<ApiResponse<{ workExperience: WorkExperience }>>('/work-experience', data),
    update: (id: string, data: Partial<WorkExperience>) => api.put<ApiResponse<{ workExperience: WorkExperience }>>(`/work-experience/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse<{ workExperience: WorkExperience }>>(`/work-experience/${id}`),
    endEmployment: (id: string) => api.patch<ApiResponse<{ workExperience: WorkExperience }>>(`/work-experience/${id}/end`),
    toggleVisibility: (id: string) => api.patch<ApiResponse<{ workExperience: WorkExperience }>>(`/work-experience/${id}/toggle-visibility`)
};
export default api;