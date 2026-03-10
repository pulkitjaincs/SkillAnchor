import ProfileClient from './ProfileClient';
import { Suspense } from 'react';

export const metadata = {
    title: 'My Profile | SkillAnchor',
    description: 'View and manage your SkillAnchor profile.',
};

export default function MyProfilePage() {
    return (
        <Suspense fallback={<div className="container py-5 text-center"><div className="spinner-border text-primary"></div></div>}>
            <ProfileClient />
        </Suspense>
    );
}
