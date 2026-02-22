import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
    const [role, setRole] = useState('worker');
    const [registerMethod, setRegisterMethod] = useState('phone');
    const [otpSent, setOtpSent] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
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
                if (data.token) {
                    login(data.token, data.user);
                    navigate('/');
                }
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
                if (data.token) {
                    login(data.token, data.user);
                    navigate('/');
                }
            }
        } catch (err) {
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
