import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import React from 'react';

describe('Dashboard Stats (ProfileHeader)', () => {
    const mockProfile = {
        name: 'John Doe',
        role: 'worker',
        city: 'Bangalore',
        state: 'Karnataka',
        phone: '9876543210',
        bio: 'Experienced driver',
        avatarUrl: '',
        documents: { aadhaar: { verified: false } }
    } as unknown as React.ComponentProps<typeof ProfileHeader>['profile'];

    const mockGetAge = vi.fn(() => 25);

    it('should show completion alert when profile is incomplete ( < 100% )', () => {
        render(
            <ProfileHeader 
                profile={mockProfile} 
                isOwnProfile={true} 
                isEmployer={false} 
                completionPercent={65} 
                getAge={mockGetAge} 
            />
        );

        expect(screen.getByText('65%')).toBeInTheDocument();
        expect(screen.getByText(/Complete your profile/i)).toBeInTheDocument();
        expect(screen.getByText(/Complete Now/i)).toBeInTheDocument();
    });

    it('should hide completion alert when profile is 100% complete', () => {
        render(
            <ProfileHeader 
                profile={mockProfile} 
                isOwnProfile={true} 
                isEmployer={false} 
                completionPercent={100} 
                getAge={mockGetAge} 
            />
        );

        expect(screen.queryByText(/Complete your profile/i)).not.toBeInTheDocument();
    });

    it('should hide completion alert when viewing someone else\'s profile', () => {
        render(
            <ProfileHeader 
                profile={mockProfile} 
                isOwnProfile={false} // Watching another's profile
                isEmployer={false} 
                completionPercent={50} 
                getAge={mockGetAge} 
            />
        );

        expect(screen.queryByText(/Complete your profile/i)).not.toBeInTheDocument();
    });

    it('should display the correct name and role-specific details', () => {
        render(
            <ProfileHeader 
                profile={mockProfile} 
                isOwnProfile={true} 
                isEmployer={false} 
                completionPercent={100} 
                getAge={mockGetAge} 
            />
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText(/Bangalore, Karnataka/i)).toBeInTheDocument();
    });
});
