import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { applicationsAPI, jobsAPI } from '../../services/api';

export const useApplications = () => {
    return useInfiniteQuery({
        queryKey: ['applications'],
        queryFn: async ({ pageParam = null }) => {
            const params = pageParam ? { cursor: pageParam } : {};
            const { data } = await applicationsAPI.getMyApplications(params);
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasMore && lastPage.applications.length > 0) {
                return lastPage.applications[lastPage.applications.length - 1]._id;
            }
            return undefined;
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
        onMutate: async (appId) => {
            await queryClient.cancelQueries({ queryKey: ['applications'] });
            const previousApps = queryClient.getQueryData(['applications']);

            queryClient.setQueryData(['applications'], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        applications: page.applications.filter(app => app._id !== appId)
                    }))
                };
            });
            return { previousApps };
        },
        onError: (err, appId, context) => {
            if (context?.previousApps) {
                queryClient.setQueryData(['applications'], context.previousApps);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};

export const useEmployerJobs = () => {
    return useInfiniteQuery({
        queryKey: ['employer-jobs'],
        queryFn: async ({ pageParam = null }) => {
            const params = pageParam ? { cursor: pageParam } : {};
            const { data } = await jobsAPI.getMyJobs(params);
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasMore && lastPage.jobs.length > 0) {
                return lastPage.jobs[lastPage.jobs.length - 1]._id;
            }
            return undefined;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useJobApplicants = (jobId) => {
    return useInfiniteQuery({
        queryKey: ['applicants', jobId],
        queryFn: async ({ pageParam = null }) => {
            const params = pageParam ? { cursor: pageParam } : {};
            const { data } = await applicationsAPI.getJobApplicants(jobId, params);
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasMore && lastPage.applications.length > 0) {
                return lastPage.applications[lastPage.applications.length - 1]._id;
            }
            return undefined;
        },
        enabled: !!jobId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useUpdateApplicationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appId, status }) => applicationsAPI.updateStatus(appId, status),
        onMutate: async ({ appId, status }) => {
            await queryClient.cancelQueries({ queryKey: ['applicants'] });
            await queryClient.cancelQueries({ queryKey: ['applications'] });

            const previousApplicants = queryClient.getQueriesData({ queryKey: ['applicants'] });

            queryClient.setQueriesData({ queryKey: ['applicants'] }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        applications: page.applications.map(app =>
                            app._id === appId ? { ...app, status } : app
                        )
                    }))
                };
            });

            return { previousApplicants };
        },
        onError: (err, variables, context) => {
            if (context?.previousApplicants) {
                context.previousApplicants.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
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
