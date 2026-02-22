import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { profileAPI, workExperienceAPI } from '../../services/api';

export const useProfile = (userId = null, options = {}) => {
    const { enabled = true } = options;
    return useQuery({
        queryKey: userId ? ['profile', userId] : ['profile'],
        queryFn: async () => {
            const { data } = userId
                ? await profileAPI.getByUserId(userId)
                : await profileAPI.getMyProfile();
            return data;
        },
        staleTime: 1000 * 60 * 15,
        retry: 1,
        enabled,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => profileAPI.updateMyProfile(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useUploadAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => profileAPI.uploadAvatar(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useMyTeam = () => {
    return useInfiniteQuery({
        queryKey: ['my-team'],
        queryFn: async ({ pageParam = null }) => {
            const params = pageParam ? { cursor: pageParam } : {};
            const { data } = await profileAPI.getMyTeam(params);
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasMore && lastPage.team.length > 0) {
                return lastPage.team[lastPage.team.length - 1]._id;
            }
            return undefined;
        },
        staleTime: 1000 * 60 * 10, // 10 mins
    });
};

export const useEndEmployment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => workExperienceAPI.endEmployment(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['my-team'] });

            const previousTeam = queryClient.getQueryData(['my-team']);

            queryClient.setQueryData(['my-team'], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        team: page.team.filter(member => member._id !== id)
                    }))
                };
            });

            return { previousTeam };
        },
        onError: (err, variables, context) => {
            if (context?.previousTeam) {
                queryClient.setQueryData(['my-team'], context.previousTeam);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['my-team'] });
        },
    });
};

