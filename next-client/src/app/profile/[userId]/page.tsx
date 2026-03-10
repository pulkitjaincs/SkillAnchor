import ProfileClient from '../ProfileClient';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'User Profile | SkillAnchor',
    description: 'View a user profile on SkillAnchor.',
};

export default function UserProfilePage() {
    return (
        <Suspense fallback={<div className="container py-5 text-center"><div className="spinner-border text-primary"></div></div>}>
            <ProfileClient />
        </Suspense>
    );
}
