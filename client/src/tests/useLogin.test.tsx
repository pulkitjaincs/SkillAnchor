import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogin } from '@/hooks/ui/useLogin';
import { authAPI } from '@/lib/api';
import { useAuth, AuthContextType } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type React from 'react';

vi.mock('@/lib/api', () => ({
    authAPI: {
        sendOTP: vi.fn(),
        verifyOTP: vi.fn(),
        login: vi.fn()
    }
}));

vi.mock('@/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    useSearchParams: () => ({ get: () => '/' })
}));

describe('useLogin Hook', () => {
    const mockLogin = vi.fn();
    const mockPush = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ login: mockLogin } as unknown as AuthContextType);
        vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useLogin());
        expect(result.current.loginMethod).toBe('phone');
        expect(result.current.otpSent).toBe(false);
    });

    it('should call sendOTP and transition state on valid phone submission', async () => {
        vi.mocked(authAPI.sendOTP).mockResolvedValue({ data: { isNewUser: false } } as unknown as Awaited<ReturnType<typeof authAPI.sendOTP>>);
        const { result } = renderHook(() => useLogin());

        await act(async () => {
            result.current.setPhone('9876543210');
        });

        await act(async () => {
            await result.current.handleLogin({ preventDefault: vi.fn() } as unknown as React.FormEvent);
        });

        expect(authAPI.sendOTP).toHaveBeenCalledWith({ phone: '9876543210' });
        expect(result.current.otpSent).toBe(true);
    });

    it('should call verifyOTP and login on valid OTP submission', async () => {
        vi.mocked(authAPI.verifyOTP).mockResolvedValue({ data: { user: { name: 'Test' } } } as unknown as Awaited<ReturnType<typeof authAPI.verifyOTP>>);
        const { result } = renderHook(() => useLogin());

        // Setup state as if OTP was already sent
        await act(async () => {
            result.current.setPhone('9876543210');
            result.current.setOtpSent(true);
            result.current.setOtp('123456');
        });

        await act(async () => {
            await result.current.handleLogin({ preventDefault: vi.fn() } as unknown as React.FormEvent);
        });

        expect(authAPI.verifyOTP).toHaveBeenCalledWith({ phone: '9876543210', otp: '123456' });
        expect(mockLogin).toHaveBeenCalledWith({ name: 'Test' });
        expect(mockPush).toHaveBeenCalledWith('/');
    });
});
