import { useQuery, useMutation, useQueryClient, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { profileAPI, workExperienceAPI } from '@/lib/api';

export const useProfile = (userId: string | null = null, options: { enabled?: boolean } = {}) => {
    const { enabled = true } = options;
    return useQuery({
        queryKey: userId ? ['profile', userId] : ['profile'],
        queryFn: async () => {
            const { data } = userId
                ? await profileAPI.getByUserId(userId)
                : await profileAPI.getMyProfile();
            return data.data?.profile ?? null;
        },
        staleTime: 1000 * 60 * 15,
        retry: 1,
        enabled,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => profileAPI.updateMyProfile(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useUpdateAvatarUrl = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (avatarKey: string) => profileAPI.updateAvatarUrl(avatarKey),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useMyTeam = () => {
    return useInfiniteQuery({
        queryKey: ['my-team'],
        queryFn: async ({ pageParam = null }: { pageParam?: unknown }) => {
            const params = pageParam ? { cursor: pageParam } : {};
            const { data } = await profileAPI.getMyTeam(params);
            return data;
        },
        getNextPageParam: (lastPage) => {
            const page = lastPage as unknown as { hasMore: boolean; team: { _id: string }[] };
            if (page.hasMore && page.team.length > 0) {
                return page.team[page.team.length - 1]._id;
            }
            return undefined;
        },
        staleTime: 1000 * 60 * 10, // 10 mins
        initialPageParam: null
    });
};

export const useEndEmployment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => workExperienceAPI.endEmployment(id),
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: ['my-team'] });

            const previousTeam = queryClient.getQueryData(['my-team']);

            queryClient.setQueryData(['my-team'], (old: InfiniteData<{ team: { _id: string }[] }> | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        team: page.team.filter((member) => member._id !== id)
                    }))
                };
            });

            return { previousTeam };
        },
        onError: (_err, _variables, context: { previousTeam: unknown } | undefined) => {
            if (context?.previousTeam) {
                queryClient.setQueryData(['my-team'], context.previousTeam);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['my-team'] });
        },
    });
};
