import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    sendOTP: (data) => api.post('/auth/send-otp', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    logout: () => api.post('/auth/logout'),
    updatePassword: (data) => api.post('/auth/update-password', data),
    sendUpdateOTP: (data) => api.post('/auth/send-update-otp', data),
    verifyUpdateOTP: (data) => api.post('/auth/verify-update-otp', data)
};

// Jobs API
export const jobsAPI = {
    getAll: (params) => api.get('/jobs', { params }),
    getById: (id) => api.get(`/jobs/${id}`),
    getMyJobs: (params) => api.get('/jobs/my-jobs', { params }),
    create: (data) => api.post('/jobs', data),
    update: (id, data) => api.put(`/jobs/${id}`, data),
    delete: (id) => api.delete(`/jobs/${id}`)
};

// Applications API
export const applicationsAPI = {
    apply: (jobId, data) => api.post(`/applications/apply/${jobId}`, data),
    getMyApplications: (params) => api.get('/applications/my-applications', { params }),
    getJobApplicants: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
    updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
    withdraw: (id) => api.delete(`/applications/${id}`)
};

// Profile API
export const profileAPI = {
    getMyProfile: () => api.get('/profile/my-profile'),
    updateMyProfile: (data) => api.put('/profile/my-profile', data),
    getByUserId: (userId) => api.get(`/profile/user/${userId}`),
    getMyTeam: (params) => api.get('/profile/my-team', { params }),
    uploadAvatar: (formData) => api.post('/profile/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Work Experience API
export const workExperienceAPI = {
    getByUser: (userId) => api.get(`/work-experience/user/${userId}`),
    create: (data) => api.post('/work-experience', data),
    update: (id, data) => api.put(`/work-experience/${id}`, data),
    delete: (id) => api.delete(`/work-experience/${id}`),
    endEmployment: (id) => api.patch(`/work-experience/${id}/end`),
    toggleVisibility: (id) => api.patch(`/work-experience/${id}/toggle-visibility`)
};

export default api;
