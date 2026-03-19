import { useQuery, useMutation, useQueryClient, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { applicationsAPI, jobsAPI } from '@/lib/api';
import { Application, PaginatedApplicationsResponse, PaginatedJobsResponse, Job } from '@/types';

export const useApplications = (enabled = true) => {
    return useInfiniteQuery({
        queryKey: ['applications'],
        queryFn: async ({ pageParam = null }: { pageParam?: unknown }) => {
            const params = pageParam ? { cursor: pageParam } : {};
            const { data } = await applicationsAPI.getMyApplications(params);
            return data;
        },
        getNextPageParam: (lastPage: PaginatedApplicationsResponse) => {
            if (!lastPage.hasMore || lastPage.applications.length === 0) return undefined;
            return lastPage.applications[lastPage.applications.length - 1]._id;
        },
        staleTime: 1000 * 60 * 5,
        initialPageParam: null,
        enabled,
    });
};

export const useJobDetails = (jobId: string) => {
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
        mutationFn: ({ jobId, data }: { jobId: string, data: any }) => applicationsAPI.apply(jobId, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', variables.jobId] });
        },
    });
};

export const useWithdrawApplication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (appId: string) => applicationsAPI.withdraw(appId),
        onMutate: async (appId) => {
            await queryClient.cancelQueries({ queryKey: ['applications'] });
            const previousApps = queryClient.getQueryData(['applications']);

            queryClient.setQueryData(['applications'], (old: InfiniteData<PaginatedApplicationsResponse>) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: PaginatedApplicationsResponse) => ({
                        ...page,
                        applications: page.applications.filter((app: Application) => app._id !== appId)
                    }))
                };
            });
            return { previousApps };
        },
        onError: (err, appId, context: any) => {
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
        queryFn: async ({ pageParam = null }: { pageParam?: unknown }) => {
            const params = pageParam ? { cursor: pageParam } : {};
            const { data } = await jobsAPI.getMyJobs(params);
            return data;
        },
        getNextPageParam: (lastPage: PaginatedJobsResponse) => {
            if (!lastPage.hasMore || lastPage.jobs.length === 0) return undefined;
            return lastPage.jobs[lastPage.jobs.length - 1]._id;
        },
        staleTime: 1000 * 60 * 5,
        initialPageParam: null
    });
};

export const useJobApplicants = (jobId: string) => {
    return useInfiniteQuery({
        queryKey: ['applicants', jobId],
        queryFn: async ({ pageParam = null }: { pageParam?: unknown }) => {
            const params = pageParam ? { cursor: pageParam } : {};
            const { data } = await applicationsAPI.getJobApplicants(jobId, params);
            return data;
        },
        getNextPageParam: (lastPage: PaginatedApplicationsResponse) => {
            if (!lastPage.hasMore || lastPage.applications.length === 0) return undefined;
            return lastPage.applications[lastPage.applications.length - 1]._id;
        },
        enabled: !!jobId,
        staleTime: 1000 * 60 * 5,
        initialPageParam: null
    });
};

export const useUpdateApplicationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appId, status }: { appId: string, status: string }) => applicationsAPI.updateStatus(appId, status),
        onMutate: async ({ appId, status }) => {
            await queryClient.cancelQueries({ queryKey: ['applicants'] });
            await queryClient.cancelQueries({ queryKey: ['applications'] });

            const previousApplicants = queryClient.getQueriesData({ queryKey: ['applicants'] });

            queryClient.setQueriesData({ queryKey: ['applicants'] }, (old: InfiniteData<PaginatedApplicationsResponse>) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: PaginatedApplicationsResponse) => ({
                        ...page,
                        applications: page.applications.map((app: Application) =>
                            app._id === appId ? { ...app, status } : app
                        )
                    }))
                };
            });

            return { previousApplicants };
        },
        onError: (err, variables, context: any) => {
            if (context?.previousApplicants) {
                context.previousApplicants.forEach(([queryKey, data]: any) => {
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
        mutationFn: (jobId: string) => jobsAPI.delete(jobId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
};

export const useCreateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Job>) => jobsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
};

export const useUpdateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Job> }) => jobsAPI.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', variables.id] });
        },
    });
};
