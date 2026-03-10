import EditProfileClient from './EditProfileClient';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Profile | SkillAnchor',
    description: 'Edit your SkillAnchor profile.',
};

export default function EditProfilePage() {
    return (
        <Suspense fallback={<div className="container py-5 text-center"><div className="spinner-border text-primary"></div></div>}>
            <EditProfileClient />
        </Suspense>
    );
}
