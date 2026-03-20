import { Metadata } from 'next';
import JobDetailClient from './JobDetailClient';
import { jobsAPI } from '@/lib/api';

export const revalidate = 60; // ISR 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    try {
        const res = await jobsAPI.getById(resolvedParams.id);
        const job = res.data?.data?.job;
        if (!job) return { title: 'Job Not Found - SkillAnchor' };

        return {
            title: `${job.title} at ${job.company?.name || 'SkillAnchor'}`,
            description: job.description?.substring(0, 160) || 'View job description on SkillAnchor',
        };
    } catch {
        return { title: 'Job - SkillAnchor' };
    }
}

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <JobDetailClient id={resolvedParams.id} />;
}
