import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyJobsPage from '@/app/(employer)/my-jobs/page';
import { useEmployerJobs, useDeleteJob } from '@/hooks/queries/useApplications';
import { Job } from '@/types';
import React from 'react';

// 1. Mock the hooks
vi.mock('@/hooks/queries/useApplications', () => ({
    useEmployerJobs: vi.fn(),
    useDeleteJob: vi.fn()
}));

// 2. Mock Virtuoso
vi.mock('react-virtuoso', () => ({
    Virtuoso: ({ data, itemContent }: { data: unknown[], itemContent: (index: number, item: unknown) => React.ReactNode }) => (
        <div data-testid="virtuoso-list">
            {data.map((item, index) => (
                <div key={index}>{itemContent(index, item)}</div>
            ))}
        </div>
    )
}));

describe('MyJobs Page', () => {
    const mockDeleteAsync = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useDeleteJob).mockReturnValue({
            mutateAsync: mockDeleteAsync,
            isPending: false,
            variables: undefined,
            mutate: vi.fn(),
            reset: vi.fn(),
            status: 'idle',
        } as unknown as ReturnType<typeof useDeleteJob>);
    });

    it('should show a loading spinner when data is fetching', () => {
        vi.mocked(useEmployerJobs).mockReturnValue({
            isLoading: true,
            data: undefined,
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: vi.fn(),
        } as unknown as ReturnType<typeof useEmployerJobs>);

        render(<MyJobsPage />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render a list of jobs with application counts', () => {
        const mockJobs = [
            { 
                _id: 'job1', 
                title: 'Software Dev', 
                city: 'Delhi', 
                state: 'DL', 
                salaryMin: 50000, 
                salaryMax: 100000, 
                status: 'active',
                applicationsCount: 5,
                createdAt: new Date().toISOString()
            }
        ] as unknown as Job[];

        vi.mocked(useEmployerJobs).mockReturnValue({
            isLoading: false,
            data: { pages: [{ jobs: mockJobs }] },
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: vi.fn(),
        } as unknown as ReturnType<typeof useEmployerJobs>);

        render(<MyJobsPage />);
        
        expect(screen.getByText('Software Dev')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });
});
