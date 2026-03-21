import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobCard from '@/components/common/Card';

describe('JobCard Component', () => {
    const mockJob = {
        _id: '123',
        title: 'Frontend Developer',
        company: { name: 'TechCorp', logo: '' },
        city: 'Bangalore',
        state: 'Karnataka',
        salaryMin: 50000,
        salaryMax: 80000,
        createdAt: new Date().toISOString(),
    } as unknown as React.ComponentProps<typeof JobCard>['job'];

    it('should render job details correctly', () => {
        render(<JobCard job={mockJob} isSelected={false} onClick={() => {}} />);
        
        expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
        expect(screen.getByText('TechCorp')).toBeInTheDocument();
        expect(screen.getByText(/Bangalore/)).toBeInTheDocument();
        // Verify formatted salary
        expect(screen.getByText(/50,000/)).toBeInTheDocument();
    });

    it('should call onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<JobCard job={mockJob} isSelected={false} onClick={handleClick} />);
        
        const cardTitle = screen.getByText('Frontend Developer');
        const cardElement = cardTitle.closest('.card');
        
        expect(cardElement).not.toBeNull();
        fireEvent.click(cardElement!);
        expect(handleClick).toHaveBeenCalledOnce();
    });

    it('should apply selected styles when isSelected is true', () => {
        const { container } = render(<JobCard job={mockJob} isSelected={true} onClick={() => {}} />);
        const cardElement = container.firstChild as HTMLElement;
        
        // Check for the "selected" class or specific styles
        expect(cardElement.className).toContain('selected');
        expect(cardElement.style.backgroundColor).toBe('var(--bg-surface)');
    });
});
