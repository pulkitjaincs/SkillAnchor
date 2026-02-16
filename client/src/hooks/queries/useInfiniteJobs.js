import { useInfiniteQuery } from '@tanstack/react-query';
import { jobsAPI } from '../../services/api';

export const useInfiniteJobs = (filters = {}) => {
    return useInfiniteQuery({
        queryKey: ['jobs', filters],
        queryFn: async ({ pageParam = null }) => {
            const params = {
                ...filters,
                cursor: pageParam,
                limit: 10
            };
            const { data } = await jobsAPI.getAll(params);
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage.hasMore || lastPage.jobs.length === 0) return undefined;
            return lastPage.jobs[lastPage.jobs.length - 1]._id;
        },
        getPreviousPageParam: () => undefined,
        staleTime: 1000 * 60 * 5,
    });
};
