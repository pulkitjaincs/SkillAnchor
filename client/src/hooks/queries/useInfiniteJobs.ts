import { useInfiniteQuery } from '@tanstack/react-query';
import { jobsAPI } from '@/lib/api';
import { PaginatedJobsResponse } from '@/types';

export const useInfiniteJobs = (filters: Record<string, any> = {}) => {
    return useInfiniteQuery({
        queryKey: ['jobs', filters],
        queryFn: async ({ pageParam = null }: { pageParam?: unknown }) => {
            const params: Record<string, any> = { limit: 10 };
            // Only include non-empty filter values
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params[key] = value;
            });
            if (pageParam) params.cursor = pageParam;
            const { data } = await jobsAPI.getAll(params);
            return data;
        },
        getNextPageParam: (lastPage: PaginatedJobsResponse) => {
            if (!lastPage.hasMore || lastPage.jobs.length === 0) return undefined;
            return lastPage.jobs[lastPage.jobs.length - 1]._id;
        },
        getPreviousPageParam: () => undefined,
        staleTime: 1000 * 60 * 5,
        initialPageParam: null
    });
};
