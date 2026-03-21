import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '@/components/layout/Navbar';
import { useAuth, AuthContextType, User } from '@/context/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Mock the Auth Context
vi.mock('@/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

// Mock Next.js Navigation
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
    useSearchParams: vi.fn()
}));

describe('Navbar Component', () => {
    const mockPush = vi.fn();
    const mockLogout = vi.fn();

    // Helper to create a complete mock Auth context
    const createMockAuth = (overrides: Partial<AuthContextType>): AuthContextType => ({
        user: null,
        loading: false,
        login: vi.fn(),
        logout: mockLogout,
        updateUserData: vi.fn(),
        ...overrides
    });

    beforeEach(() => {
        vi.clearAllMocks();
        // Cast via unknown to satisfy the complex Next.js types without using 'any'
        vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
        vi.mocked(usePathname).mockReturnValue('/');
        vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>);
    });

    it('should render "Sign In" button for unauthenticated users', () => {
        vi.mocked(useAuth).mockReturnValue(createMockAuth({ user: null }));
        render(<Navbar />);
        
        expect(screen.getByText('Sign In')).toBeInTheDocument();
        expect(screen.queryByText(/My Profile/i)).not.toBeInTheDocument();
    });

    it('should render "My Applications" for authenticated workers', () => {
        const workerUser: User = { _id: '1', name: 'Worker John', role: 'worker' };
        vi.mocked(useAuth).mockReturnValue(createMockAuth({ user: workerUser }));
        
        render(<Navbar />);
        
        expect(screen.getByText('My Applications')).toBeInTheDocument();
        expect(screen.getByText('Worker John')).toBeInTheDocument();
    });

    it('should render employer-specific links for authenticated employers', () => {
        const employerUser: User = { _id: '2', name: 'Employer Jane', role: 'employer' };
        vi.mocked(useAuth).mockReturnValue(createMockAuth({ user: employerUser }));
        
        render(<Navbar />);
        
        expect(screen.getByText('My Jobs')).toBeInTheDocument();
        expect(screen.getByText('My Team')).toBeInTheDocument();
    });

    it('should call logout when the logout button is clicked', () => {
        const testUser: User = { _id: '3', name: 'Test User', role: 'worker' };
        vi.mocked(useAuth).mockReturnValue(createMockAuth({ user: testUser }));
        
        render(<Navbar />);

        const userDropdown = screen.getByText('Test User');
        fireEvent.click(userDropdown);

        const logoutButton = screen.getByText(/Logout/i);
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalledOnce();
    });
});
