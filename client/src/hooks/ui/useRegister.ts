import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

export const useRegister = () => {
    const [role, setRole] = useState<'worker' | 'employer'>('worker');
    const [registerMethod, setRegisterMethod] = useState<'phone' | 'email'>('phone');
    const [otpSent, setOtpSent] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleRegister = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('');

        if (name.length < 3) {
            setError('Name must be at least 3 characters long');
            return;
        }

        setLoading(true);

        try {
            if (registerMethod === 'phone') {
                if (phone.length !== 10) {
                    setError('Please enter a valid 10-digit phone number');
                    setLoading(false);
                    return;
                }
                if (!otpSent) {
                    await authAPI.sendOTP({ phone, role });
                    setOtpSent(true);
                    setLoading(false);
                    return;
                }
                if (otp.length !== 6) {
                    setError('Please enter a valid 6-digit OTP');
                    setLoading(false);
                    return;
                }
                const { data } = await authAPI.verifyOTP({ phone, role, name, otp });
                login(data.user);
                router.push('/');
            }

            if (registerMethod === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    setError('Please enter a valid email address');
                    setLoading(false);
                    return;
                }
                if (!password) {
                    setError('Please enter your password');
                    setLoading(false);
                    return;
                }
                const { data } = await authAPI.register({ email, role, name, password });
                login(data.user);
                router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return {
        role, setRole,
        registerMethod, setRegisterMethod,
        otpSent, setOtpSent,
        name, setName,
        phone, setPhone,
        otp, setOtp,
        email, setEmail,
        password, setPassword,
        error, setError,
        loading,
        handleRegister
    };
};
