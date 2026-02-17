import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useForm } from '../hooks';
import { InputField, Button } from '../components/common/FormComponents';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
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
    const { login, user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate(redirect);
            return;
        }
    }, [user]);

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
            // Phone OTP Login
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

            // Email Login
            if (loginMethod === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    setError('Please enter a valid email address');
                    setLoading(false);
                    return;
                }

                // Email + Password
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

                // Email + OTP
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

    return (
        <div className="container-fluid flex-grow-1 d-flex align-items-center justify-content-center px-4 py-5">
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

                    <div className="card border-0 shadow-lg" style={{ borderRadius: '24px', background: 'var(--bg-card)', overflow: 'hidden' }}>

                        <div className="text-center pt-5 pb-4 px-4" style={{ background: 'linear-gradient(135deg, var(--primary-100), var(--zinc-100))' }}>
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                style={{ width: '64px', height: '64px', background: 'var(--text-main)', color: 'var(--bg-body)' }}>
                                <span className="fw-bold" style={{ fontSize: '28px', letterSpacing: '-0.05em' }}>S</span>
                            </div>
                            <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.03em', color: 'var(--text-main)' }}>Welcome Back</h2>
                            <p className="mb-0" style={{ color: 'var(--text-muted)' }}>Sign in to find your next opportunity</p>
                        </div>

                        <div className="card-body p-4 p-md-5">

                            {/* Phone / Email Toggle */}
                            <div className="d-flex gap-2 mb-4 p-1 rounded-pill" style={{ background: 'var(--bg-surface)' }}>
                                <button type="button" onClick={() => { setLoginMethod('phone'); resetState(); }}
                                    className={`btn flex-grow-1 rounded-pill py-2 fw-medium ${loginMethod === 'phone' ? 'shadow-sm' : ''}`}
                                    style={{ background: loginMethod === 'phone' ? 'var(--bg-card)' : 'transparent', color: loginMethod === 'phone' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', transition: 'all 0.3s ease' }}>
                                    <i className="bi bi-phone me-2"></i>Phone
                                </button>
                                <button type="button" onClick={() => { setLoginMethod('email'); resetState(); }}
                                    className={`btn flex-grow-1 rounded-pill py-2 fw-medium ${loginMethod === 'email' ? 'shadow-sm' : ''}`}
                                    style={{ background: loginMethod === 'email' ? 'var(--bg-card)' : 'transparent', color: loginMethod === 'email' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', transition: 'all 0.3s ease' }}>
                                    <i className="bi bi-envelope me-2"></i>Email
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                    <i className="bi bi-exclamation-circle" style={{ color: '#ef4444' }}></i>
                                    <span className="small fw-medium" style={{ color: '#ef4444' }}>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleLogin}>
                                {/* Phone OTP Login */}
                                {loginMethod === 'phone' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Phone Number</label>
                                            <div className="input-group">
                                                <span className="input-group-text border-0 fw-medium" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', borderRadius: '12px 0 0 12px' }}>+91</span>
                                                <input
                                                    type="tel"
                                                    className="form-control border-0 py-3"
                                                    placeholder="Enter your phone number"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    disabled={otpSent}
                                                    style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '0 12px 12px 0', fontSize: '1rem' }} />
                                            </div>
                                        </div>

                                        {otpSent && (
                                            <div className="mb-4">
                                                <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Enter OTP</label>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 py-3"
                                                    placeholder="6-digit OTP"
                                                    maxLength={6}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1.2rem', letterSpacing: '0.5em', textAlign: 'center' }} />
                                                <button type="button" className="btn btn-link p-0 mt-2 text-decoration-none" onClick={resetState} style={{ color: 'var(--primary-600)', fontSize: '0.875rem' }}>Change number</button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Email Login */}
                                {loginMethod === 'email' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Email Address</label>
                                            <input
                                                type="email"
                                                className="form-control border-0 py-3"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={otpSent}
                                                style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1rem' }} />
                                        </div>

                                        {/* Password / OTP sub-toggle */}
                                        {!otpSent && (
                                            <div className="d-flex gap-2 mb-4">
                                                <button type="button" onClick={() => { setEmailMethod('password'); setOtp(''); }}
                                                    className={`btn flex-grow-1 py-2 fw-medium rounded-3 ${emailMethod === 'password' ? '' : ''}`}
                                                    style={{
                                                        background: emailMethod === 'password' ? 'var(--text-main)' : 'var(--bg-surface)',
                                                        color: emailMethod === 'password' ? 'var(--bg-body)' : 'var(--text-muted)',
                                                        border: 'none',
                                                        fontSize: '0.85rem',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                    <i className="bi bi-lock me-1"></i>Password
                                                </button>
                                                <button type="button" onClick={() => { setEmailMethod('otp'); setPassword(''); }}
                                                    className={`btn flex-grow-1 py-2 fw-medium rounded-3`}
                                                    style={{
                                                        background: emailMethod === 'otp' ? 'var(--text-main)' : 'var(--bg-surface)',
                                                        color: emailMethod === 'otp' ? 'var(--bg-body)' : 'var(--text-muted)',
                                                        border: 'none',
                                                        fontSize: '0.85rem',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                    <i className="bi bi-shield-lock me-1"></i>OTP
                                                </button>
                                            </div>
                                        )}

                                        {/* Password input */}
                                        {emailMethod === 'password' && (
                                            <div className="mb-4">
                                                <label className="form-label fw-medium small text-uppercase d-flex justify-content-between" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                                                    Password
                                                    <Link to="/forgot-password" className="text-decoration-none" style={{ color: 'var(--primary-600)', textTransform: 'none', letterSpacing: 'normal' }}>Forgot?</Link>
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control border-0 py-3"
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1rem' }} />
                                            </div>
                                        )}

                                        {/* Email OTP input */}
                                        {emailMethod === 'otp' && otpSent && (
                                            <div className="mb-4">
                                                <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Enter OTP</label>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 py-3"
                                                    placeholder="6-digit OTP"
                                                    maxLength={6}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1.2rem', letterSpacing: '0.5em', textAlign: 'center' }} />
                                                <button type="button" className="btn btn-link p-0 mt-2 text-decoration-none" onClick={resetState} style={{ color: 'var(--primary-600)', fontSize: '0.875rem' }}>Change email</button>
                                            </div>
                                        )}
                                    </>
                                )}

                                <button type="submit" className="btn w-100 py-3 fw-bold rounded-pill shadow-lg" disabled={loading}
                                    style={{ background: 'var(--text-main)', color: 'var(--bg-body)', fontSize: '1rem', transition: 'all 0.3s ease' }}>
                                    {loading ? 'Please wait...' : getButtonText()}
                                </button>
                            </form>

                            <div className="d-flex align-items-center my-4">
                                <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
                                <span className="px-3 small" style={{ color: 'var(--text-muted)' }}>or</span>
                                <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
                            </div>

                            <p className="text-center mb-0" style={{ color: 'var(--text-muted)' }}>
                                New to SkillAnchor?{' '}
                                <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: 'var(--text-main)' }}>Create an account</Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-center mt-4 small" style={{ color: 'var(--text-muted)' }}>
                        By continuing, you agree to our{' '}
                        <Link to="/terms" className="text-decoration-none" style={{ color: 'var(--text-main)' }}>Terms</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-decoration-none" style={{ color: 'var(--text-main)' }}>Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;