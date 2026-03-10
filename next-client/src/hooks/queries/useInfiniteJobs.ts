import { useInfiniteQuery } from '@tanstack/react-query';
import { jobsAPI } from '@/lib/api';

export const useInfiniteJobs = (filters: Record<string, any> = {}) => {
    return useInfiniteQuery({
        queryKey: ['jobs', filters],
        queryFn: async ({ pageParam = null }: { pageParam?: unknown }) => {
            const params = {
                ...filters,
                cursor: pageParam,
                limit: 10
            };
            const { data } = await jobsAPI.getAll(params);
            return data;
        },
        getNextPageParam: (lastPage: any) => {
            if (!lastPage.hasMore || lastPage.jobs.length === 0) return undefined;
            return lastPage.jobs[lastPage.jobs.length - 1]._id;
        },
        getPreviousPageParam: () => undefined,
        staleTime: 1000 * 60 * 5,
        initialPageParam: null
    });
};
