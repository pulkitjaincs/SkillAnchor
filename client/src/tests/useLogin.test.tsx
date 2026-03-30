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

    const submit = (result: ReturnType<typeof useLogin>) =>
        result.handleLogin({ preventDefault: vi.fn() } as unknown as React.FormEvent);

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useLogin());
        expect(result.current.loginMethod).toBe('phone');
        expect(result.current.otpSent).toBe(false);
    });

    // ── Phone: send OTP ─────────────────────────────────────────────────────────
    it('should call sendOTP and transition state on valid phone submission', async () => {
        vi.mocked(authAPI.sendOTP).mockResolvedValue({ data: { isNewUser: false } } as unknown as Awaited<ReturnType<typeof authAPI.sendOTP>>);
        const { result } = renderHook(() => useLogin());

        await act(async () => { result.current.setPhone('9876543210'); });
        await act(async () => { await submit(result.current); });
        expect(authAPI.sendOTP).toHaveBeenCalledWith({ authType: 'phone', phone: '9876543210' });
        expect(result.current.otpSent).toBe(true);
    });

    // ── Phone: verify OTP ────────────────────────────────────────────────────────
    it('should call verifyOTP and login on valid OTP submission', async () => {
        vi.mocked(authAPI.verifyOTP).mockResolvedValue({ data: { user: { name: 'Test' } } } as unknown as Awaited<ReturnType<typeof authAPI.verifyOTP>>);
        const { result } = renderHook(() => useLogin());

        await act(async () => {
            result.current.setPhone('9876543210');
            result.current.setOtpSent(true);
            result.current.setOtp('123456');
        });
        await act(async () => { await submit(result.current); });
        expect(authAPI.verifyOTP).toHaveBeenCalledWith({ authType: 'phone', phone: '9876543210', otp: '123456' });
        expect(mockLogin).toHaveBeenCalledWith({ name: 'Test' });
        expect(mockPush).toHaveBeenCalledWith('/');
    });

    // ── Phone: new user requires name ────────────────────────────────────────────
    it('should send name and role when verifying OTP for a new phone user', async () => {
        vi.mocked(authAPI.sendOTP).mockResolvedValue({ data: { isNewUser: true } } as unknown as Awaited<ReturnType<typeof authAPI.sendOTP>>);
        vi.mocked(authAPI.verifyOTP).mockResolvedValue({ data: { user: { name: 'New User' } } } as unknown as Awaited<ReturnType<typeof authAPI.verifyOTP>>);
        const { result } = renderHook(() => useLogin());

        await act(async () => { result.current.setPhone('9876543210'); });
        await act(async () => { await submit(result.current); }); // sends OTP → isNewUser=true, otpSent=true

        await act(async () => {
            result.current.setOtp('123456');
            result.current.setName('New User');
        });
        await act(async () => { await submit(result.current); });
        expect(authAPI.verifyOTP).toHaveBeenCalledWith({ authType: 'phone', phone: '9876543210', otp: '123456', name: 'New User', role: 'worker' });
    });

    // ── Phone: validation errors ─────────────────────────────────────────────────
    it('should set error for invalid phone number', async () => {
        const { result } = renderHook(() => useLogin());
        await act(async () => { result.current.setPhone('123'); });
        await act(async () => { await submit(result.current); });
        expect(result.current.error).toBe('Please enter a valid 10-digit phone number');
    });

    it('should set error for invalid OTP length', async () => {
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            result.current.setPhone('9876543210');
            result.current.setOtpSent(true);
            result.current.setOtp('123'); // too short
        });
        await act(async () => { await submit(result.current); });
        expect(result.current.error).toBe('Please enter a valid 6-digit OTP');
    });

    it('should set error when new phone user submits empty name', async () => {
        vi.mocked(authAPI.sendOTP).mockResolvedValue({ data: { isNewUser: true } } as unknown as Awaited<ReturnType<typeof authAPI.sendOTP>>);
        const { result } = renderHook(() => useLogin());
        await act(async () => { result.current.setPhone('9876543210'); });
        await act(async () => { await submit(result.current); }); // sends OTP

        await act(async () => { result.current.setOtp('123456'); }); // name is still ''
        await act(async () => { await submit(result.current); });
        expect(result.current.error).toBe('Please enter your full name');
    });

    // ── Email / password ─────────────────────────────────────────────────────────
    it('should login via email + password', async () => {
        vi.mocked(authAPI.login).mockResolvedValue({ data: { user: { name: 'Test' } } } as unknown as Awaited<ReturnType<typeof authAPI.login>>);
        const { result } = renderHook(() => useLogin());

        await act(async () => {
            result.current.setLoginMethod('email');
            result.current.setEmail('test@example.com');
            result.current.setPassword('secret123');
        });
        await act(async () => { await submit(result.current); });
        expect(authAPI.login).toHaveBeenCalledWith({ authType: 'email', email: 'test@example.com', password: 'secret123' });
        expect(mockLogin).toHaveBeenCalledWith({ name: 'Test' });
    });

    it('should set error for invalid email', async () => {
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            result.current.setLoginMethod('email');
            result.current.setEmail('not-an-email');
        });
        await act(async () => { await submit(result.current); });
        expect(result.current.error).toBe('Please enter a valid email address');
    });

    it('should set error for empty password on email/password login', async () => {
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            result.current.setLoginMethod('email');
            result.current.setEmail('test@example.com');
            // password remains ''
        });
        await act(async () => { await submit(result.current); });
        expect(result.current.error).toBe('Please enter your password');
    });

    // ── Email / OTP ──────────────────────────────────────────────────────────────
    it('should send OTP on email/OTP first step', async () => {
        vi.mocked(authAPI.sendOTP).mockResolvedValue({ data: { isNewUser: false } } as unknown as Awaited<ReturnType<typeof authAPI.sendOTP>>);
        const { result } = renderHook(() => useLogin());

        await act(async () => {
            result.current.setLoginMethod('email');
            result.current.setEmailMethod('otp');
            result.current.setEmail('test@example.com');
        });
        await act(async () => { await submit(result.current); });
        expect(authAPI.sendOTP).toHaveBeenCalledWith({ authType: 'email', email: 'test@example.com' });
        expect(result.current.otpSent).toBe(true);
    });

    it('should verify OTP on email/OTP second step', async () => {
        vi.mocked(authAPI.verifyOTP).mockResolvedValue({ data: { user: { name: 'Test' } } } as unknown as Awaited<ReturnType<typeof authAPI.verifyOTP>>);
        const { result } = renderHook(() => useLogin());

        await act(async () => {
            result.current.setLoginMethod('email');
            result.current.setEmailMethod('otp');
            result.current.setEmail('test@example.com');
            result.current.setOtpSent(true);
            result.current.setOtp('654321');
        });
        await act(async () => { await submit(result.current); });
        expect(authAPI.verifyOTP).toHaveBeenCalledWith({ authType: 'email', email: 'test@example.com', otp: '654321' });
        expect(mockLogin).toHaveBeenCalledWith({ name: 'Test' });
    });

    it('should set error for short OTP on email/OTP path', async () => {
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            result.current.setLoginMethod('email');
            result.current.setEmailMethod('otp');
            result.current.setEmail('test@example.com');
            result.current.setOtpSent(true);
            result.current.setOtp('12');
        });
        await act(async () => { await submit(result.current); });
        expect(result.current.error).toBe('Please enter a valid 6-digit OTP');
    });

    // ── API error handling ───────────────────────────────────────────────────────
    it('should set error from API response on failure', async () => {
        vi.mocked(authAPI.sendOTP).mockRejectedValue({
            response: { data: { error: 'Phone already registered' } }
        });
        const { result } = renderHook(() => useLogin());
        await act(async () => { result.current.setPhone('9876543210'); });
        await act(async () => { await submit(result.current); });
        expect(result.current.error).toBe('Phone already registered');
    });

    it('should set fallback error message on unknown error', async () => {
        vi.mocked(authAPI.sendOTP).mockRejectedValue({});
        const { result } = renderHook(() => useLogin());
        await act(async () => { result.current.setPhone('9876543210'); });
        await act(async () => { await submit(result.current); });
        expect(result.current.error).toBe('Something went wrong');
    });

    // ── resetState ───────────────────────────────────────────────────────────────
    it('should reset state correctly', async () => {
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            result.current.setOtpSent(true);
            result.current.setOtp('123456');
            result.current.setError('some error');
        });
        await act(async () => { result.current.resetState(); });
        expect(result.current.otpSent).toBe(false);
        expect(result.current.otp).toBe('');
        expect(result.current.error).toBe('');
    });

    // ── getButtonText ────────────────────────────────────────────────────────────
    it('getButtonText returns correct text for each state', async () => {
        const { result } = renderHook(() => useLogin());

        // phone, no OTP sent
        expect(result.current.getButtonText()).toBe('Send OTP');

        // phone, OTP sent
        await act(async () => { result.current.setOtpSent(true); });
        expect(result.current.getButtonText()).toBe('Verify & Login');

        // email / password
        await act(async () => {
            result.current.setLoginMethod('email');
            result.current.setOtpSent(false);
        });
        expect(result.current.getButtonText()).toBe('Sign In');

        // email / otp, no OTP sent
        await act(async () => { result.current.setEmailMethod('otp'); });
        expect(result.current.getButtonText()).toBe('Send OTP');

        // email / otp, OTP sent
        await act(async () => { result.current.setOtpSent(true); });
        expect(result.current.getButtonText()).toBe('Verify & Login');
    });
});
