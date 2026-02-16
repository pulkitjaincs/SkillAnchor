import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../../services/api';

export const useProfile = (userId = null) => {
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
    return useQuery({
        queryKey: ['my-team'],
        queryFn: async () => {
            const { data } = await profileAPI.getMyTeam();
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 mins
    });
};

export const useEndEmployment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => workExperienceAPI.endEmployment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-team'] });
        },
    });
};

