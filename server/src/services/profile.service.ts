import { IUser } from "../models/User.model.js";
import type { ProfileResponse } from "../types/index.js";

export type { ProfileResponse };

export const assembleProfileResponse = (profile: Record<string, unknown> | null, user: IUser, role: 'worker' | 'employer'): ProfileResponse => {
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
