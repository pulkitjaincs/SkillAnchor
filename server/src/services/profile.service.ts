import { IUser } from "../models/User.model.js";

export interface ProfileResponse {
    name: string;
    email?: string;
    phone?: string;
    role: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    [key: string]: any;
}

export const assembleProfileResponse = (profile: Record<string, any> | null, user: IUser, role: 'worker' | 'employer'): ProfileResponse => {
    const base: ProfileResponse = {
        name: user.name || "",
        email: user.email,
        phone: user.phone,
        role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
    };

    if (!profile) {
        if (role === 'worker') {
            return { ...base, completionPercent: 0, documents: {} };
        }
        return base;
    }

    const profileData: ProfileResponse = { ...profile, ...base };
    if (!profileData.name) profileData.name = user.name;

    return profileData;
};
