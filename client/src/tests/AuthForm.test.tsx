import { describe, it, expect, vi, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import { useLogin } from '@/hooks/ui/useLogin';

// Mock the hooks and Next.js navigation
vi.mock('@/hooks/ui/useLogin');
vi.mock('@/context/AuthContext', () => ({
    useAuth: () => ({ user: null })
}));
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    useSearchParams: () => ({ get: () => '/' }),
}));

describe('Auth Form (Login Page)', () => {
    const mockUseLogin = useLogin as Mock;

    it('should render the login form initially', () => {
        mockUseLogin.mockReturnValue({
            loginMethod: 'phone',
            otpSent: false,
            phone: '',
            loading: false,
            resetState: vi.fn(),
            getButtonText: () => 'Send OTP',
            handleLogin: vi.fn(),
        });

        render(<LoginPage />);
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send otp/i })).not.toBeDisabled();
    });

    it('should show loading state and disable button when authenticating', () => {
        mockUseLogin.mockReturnValue({
            loginMethod: 'phone',
            otpSent: false,
            phone: '1234567890',
            loading: true, // TRUE!
            resetState: vi.fn(),
            getButtonText: () => 'Send OTP',
            handleLogin: vi.fn(),
        });

        render(<LoginPage />);
        
        const submitBtn = screen.getByRole('button', { name: /please wait/i });
        expect(submitBtn).toBeInTheDocument();
        expect(submitBtn).toBeDisabled();
    });

    it('should show email fields when switching method', () => {
        mockUseLogin.mockReturnValue({
            loginMethod: 'email', // EMAIL!
            emailMethod: 'password',
            otpSent: false,
            email: '',
            password: '',
            loading: false,
            resetState: vi.fn(),
            getButtonText: () => 'Sign In',
            handleLogin: vi.fn(),
        });

        render(<LoginPage />);
        expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    });
});
