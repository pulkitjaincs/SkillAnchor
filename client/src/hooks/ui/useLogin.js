import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const useLogin = () => {
    const [loginMethod, setLoginMethod] = useState('phone');
    const [emailMethod, setEmailMethod] = useState('password');
    const [otpSent, setOtpSent] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const navigate = useNavigate();
    const { login } = useAuth();

    const resetState = () => {
        setOtpSent(false);
        setOtp('');
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (loginMethod === 'phone') {
                if (phone.length !== 10) {
                    setError('Please enter a valid 10-digit phone number');
                    setLoading(false);
                    return;
                }
                if (!otpSent) {
                    await authAPI.sendOTP({ phone });
                    setOtpSent(true);
                    setLoading(false);
                    return;
                }
                if (otp.length !== 6) {
                    setError('Please enter a valid 6-digit OTP');
                    setLoading(false);
                    return;
                }
                const { data } = await authAPI.verifyOTP({ phone, otp });
                if (data.token) {
                    login(data.token, data.user);
                    navigate(redirect);
                }
            }

            if (loginMethod === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    setError('Please enter a valid email address');
                    setLoading(false);
                    return;
                }

                if (emailMethod === 'password') {
                    if (!password) {
                        setError('Please enter your password');
                        setLoading(false);
                        return;
                    }
                    const { data } = await authAPI.login({ email, password });
                    if (data.token) {
                        login(data.token, data.user);
                        navigate(redirect);
                    }
                }

                if (emailMethod === 'otp') {
                    if (!otpSent) {
                        await authAPI.sendOTP({ email });
                        setOtpSent(true);
                        setLoading(false);
                        return;
                    }
                    if (otp.length !== 6) {
                        setError('Please enter a valid 6-digit OTP');
                        setLoading(false);
                        return;
                    }
                    const { data } = await authAPI.verifyOTP({ email, otp });
                    if (data.token) {
                        login(data.token, data.user);
                        navigate(redirect);
                    }
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const getButtonText = () => {
        if (loginMethod === 'phone') {
            return otpSent ? 'Verify & Login' : 'Send OTP';
        }
        if (loginMethod === 'email') {
            if (emailMethod === 'password') return 'Sign In';
            return otpSent ? 'Verify & Login' : 'Send OTP';
        }
        return 'Sign In';
    };

    return {
        loginMethod, setLoginMethod,
        emailMethod, setEmailMethod,
        otpSent, setOtpSent,
        phone, setPhone,
        otp, setOtp,
        email, setEmail,
        password, setPassword,
        error, setError,
        loading,
        resetState,
        handleLogin,
        getButtonText,
        redirect,
        navigate
    };
};
