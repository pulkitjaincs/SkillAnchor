import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsAPI, jobsAPI } from '../../services/api';

export const useApplications = () => {
    return useQuery({
        queryKey: ['applications'],
        queryFn: async () => {
            const { data } = await applicationsAPI.getMyApplications();
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useJobDetails = (jobId) => {
    return useQuery({
        queryKey: ['jobs', jobId],
        queryFn: async () => {
            const { data } = await jobsAPI.getById(jobId);
            return data;
        },
        enabled: !!jobId,
        staleTime: 1000 * 60 * 10,
    });
};

export const useApplyForJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ jobId, data }) => applicationsAPI.apply(jobId, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', variables.jobId] });
        },
    });
};

export const useWithdrawApplication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (appId) => applicationsAPI.withdraw(appId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};

export const useEmployerJobs = () => {
    return useQuery({
        queryKey: ['employer-jobs'],
        queryFn: async () => {
            const { data } = await jobsAPI.getMyJobs();
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useJobApplicants = (jobId) => {
    return useQuery({
        queryKey: ['applicants', jobId],
        queryFn: async () => {
            const { data } = await applicationsAPI.getJobApplicants(jobId);
            return data;
        },
        enabled: !!jobId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useUpdateApplicationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appId, status }) => applicationsAPI.updateStatus(appId, status),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};

export const useDeleteJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (jobId) => jobsAPI.delete(jobId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
};

export const useCreateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => jobsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
};

export const useUpdateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => jobsAPI.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', variables.id] });
        },
    });
};
