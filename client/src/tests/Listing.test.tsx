import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  applicationsAPI: {
    getMyApplications: vi.fn(),
    apply: vi.fn(),
  },
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => {
    return <span data-testid="mock-image" aria-label={alt} data-src={src} />;
  },
}));

vi.mock('next/dynamic', () => ({
  default: () =>
    function MockApplyModal({ show, onApply }: { show: boolean; onApply: (note: string) => void }) {
      if (!show) return null;
      return (
        <div data-testid="apply-modal">
          <button onClick={() => onApply('Test cover note')}>Submit Application</button>
        </div>
      );
    },
}));

import Listing from '../components/common/Listing';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { applicationsAPI } from '@/lib/api';
import type { Job } from '@/types';

const mockJob = ({
  _id: 'job123',
  title: 'Software Engineer',
  company: { name: 'SkillAnchor', logo: '' },
  city: 'New York',
  state: 'NY',
  salaryMin: 50000,
  salaryMax: 80000,
  salaryType: 'monthly' as const,
  experienceMin: 2,
  vacancies: 1,
  description: 'A great role for a software engineer.',
  skills: ['React', 'Node.js'],
  benefits: ['Health Insurance', 'Remote Work'],
  jobType: 'full-time',
  createdAt: new Date().toISOString(),
} as unknown) as Job;

const mockPush = vi.fn();
const mockOnClose = vi.fn();

describe('Listing Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null });
    (applicationsAPI.getMyApplications as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { applications: [] },
    });
  });

  it('should render empty state when no job is provided', () => {
    render(<Listing job={null} onClose={mockOnClose} />);
    expect(screen.getByText('Select a job')).toBeInTheDocument();
    expect(screen.getByText('Click any listing to preview it here')).toBeInTheDocument();
  });

  it('should render job title, company, location and description', () => {
    render(<Listing job={mockJob} onClose={mockOnClose} />);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('SkillAnchor')).toBeInTheDocument();
    expect(screen.getByText(/New York, NY/)).toBeInTheDocument();
    expect(screen.getByText('A great role for a software engineer.')).toBeInTheDocument();
  });

  it('should render all skill badges', () => {
    render(<Listing job={mockJob} onClose={mockOnClose} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('should render all benefit items', () => {
    render(<Listing job={mockJob} onClose={mockOnClose} />);
    expect(screen.getByText('Health Insurance')).toBeInTheDocument();
    expect(screen.getByText('Remote Work')).toBeInTheDocument();
  });

  it('should redirect unauthenticated users to /login on Apply click', () => {
    render(<Listing job={mockJob} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText(/Apply Now/));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/login'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('job123'));
  });

  it('should show disabled "Already Applied" when user has applied', async () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { _id: 'user1', role: 'worker' },
    });
    (applicationsAPI.getMyApplications as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { applications: [{ job: { _id: 'job123' } }] },
    });

    render(<Listing job={mockJob} onClose={mockOnClose} />);

    const btn = await screen.findByText('Already Applied');
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it('should NOT show Apply Now button for employer users', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { _id: 'emp1', role: 'employer' },
    });

    render(<Listing job={mockJob} onClose={mockOnClose} />);
    expect(screen.queryByText(/Apply Now/)).not.toBeInTheDocument();
  });

  it('should open modal and call apply API then show Already Applied', async () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { _id: 'user1', role: 'worker' },
    });
    (applicationsAPI.apply as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true },
    });

    render(<Listing job={mockJob} onClose={mockOnClose} />);

    fireEvent.click(await screen.findByText(/Apply Now/));

    fireEvent.click(screen.getByText('Submit Application'));

    expect(applicationsAPI.apply).toHaveBeenCalledWith('job123', {
      coverNote: 'Test cover note',
    });

    await waitFor(() => {
      expect(screen.getByText('Already Applied')).toBeInTheDocument();
    });
  });

  it('should navigate to job detail page on "View full details" click', () => {
    render(<Listing job={mockJob} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('View full details'));
    expect(mockPush).toHaveBeenCalledWith('/jobs/job123');
  });
});
