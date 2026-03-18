import axios from "axios";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api";

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
    sendOTP: (data: any) => api.post('/auth/send-otp', data),
    verifyOTP: (data: any) => api.post('/auth/verify-otp', data),
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
    resetPassword: (data: any) => api.post('/auth/reset-password', data),
    logout: () => api.post('/auth/logout'),
    updatePassword: (data: any) => api.post('/auth/update-password', data),
    sendUpdateOTP: (data: any) => api.post('/auth/send-update-otp', data),
    verifyUpdateOTP: (data: any) => api.post('/auth/verify-update-otp', data),
    getMe: () => api.get('/auth/get-me')
};

// Jobs API
export const jobsAPI = {
    getAll: (params?: any) => api.get('/jobs', { params }),
    getById: (id: string) => api.get(`/jobs/${id}`),
    getMyJobs: (params?: any) => api.get('/jobs/my-jobs', { params }),
    create: (data: any) => api.post('/jobs', data),
    update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
    delete: (id: string) => api.delete(`/jobs/${id}`)
};

// Applications API
export const applicationsAPI = {
    apply: (jobId: string, data: any) => api.post(`/applications/apply/${jobId}`, data),
    getMyApplications: (params?: any) => api.get('/applications/my-applications', { params }),
    getJobApplicants: (jobId: string, params?: any) => api.get(`/applications/job/${jobId}`, { params }),
    updateStatus: (id: string, status: string) => api.patch(`/applications/${id}/status`, { status }),
    withdraw: (id: string) => api.delete(`/applications/${id}`)
};

// Profile API
export const profileAPI = {
    getMyProfile: () => api.get('/profile/my-profile'),
    updateMyProfile: (data: any) => api.put('/profile/my-profile', data),
    getByUserId: (userId: string) => api.get(`/profile/user/${userId}`),
    getMyTeam: (params?: any) => api.get('/profile/my-team', { params }),
    updateAvatarUrl: (avatarKey: string) => api.patch('/profile/update-avatar-url', { avatarKey })
};

// Work Experience API
export const workExperienceAPI = {
    getByUser: (userId: string) => api.get(`/work-experience/user/${userId}`),
    create: (data: any) => api.post('/work-experience', data),
    update: (id: string, data: any) => api.put(`/work-experience/${id}`, data),
    delete: (id: string) => api.delete(`/work-experience/${id}`),
    endEmployment: (id: string) => api.patch(`/work-experience/${id}/end`),
    toggleVisibility: (id: string) => api.patch(`/work-experience/${id}/toggle-visibility`)
};
export default api;