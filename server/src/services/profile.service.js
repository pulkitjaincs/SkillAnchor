/**
 * Assemble a unified profile response from a profile document and user document.
 * Eliminates duplicated response-building code in profile controller.
 * 
 * @param {Object|null} profile - The Mongoose lean profile document (WorkerProfile or EmployerProfile)
 * @param {Object} user - The user document (from req.user or fetched)
 * @param {string} role - 'worker' or 'employer'
 * @returns {Object} Assembled profile data
 */
export const assembleProfileResponse = (profile, user, role) => {
    const base = {
        name: user.name,
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

    const profileData = { ...profile };
    profileData.role = role;
    profileData.email = user.email;
    profileData.phone = user.phone;
    profileData.emailVerified = user.emailVerified;
    profileData.phoneVerified = user.phoneVerified;
    if (!profileData.name) profileData.name = user.name;

    return profileData;
};
