import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const [loginMethod, setLoginMethod] = useState('phone');
    const [otpSent, setOtpSent] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
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

    const handleLogin = () => {

        setError('');
        if (loginMethod === 'phone') {
            if (phone.length !== 10) {
                setError('Please enter a valid 10-digit phone number');
                return;
            }
            if (!otpSent) {
                async function sendOtp() {
                    try {
                        const sendOtpRequest = await axios.post('/api/auth/send-otp', { phone });
                        setOtpSent(true);
                    } catch (error) {
                        setError(error.response?.data?.error || 'Failed to send OTP');
                    }
                    return;
                }
                sendOtp();
                return;
            }
            if (otp.length !== 6) {
                setError('Please enter a valid 6-digit OTP');
                return;
            }
            async function verifyOtp() {
                try {
                    const verifyOtpRequest = await axios.post('/api/auth/verify-otp', { phone, otp });
                    if (verifyOtpRequest.data.token) {
                        login(verifyOtpRequest.data.token, verifyOtpRequest.data.user);
                        navigate('/');
                    }
                } catch (error) {
                    setError(error.response?.data?.error || 'Failed to verify OTP');
                }
                return;
            }
            verifyOtp();
            return;
        }
        if (loginMethod === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address');
                return;
            }
            if (!password) {
                setError('Please enter your password');
                return;
            }
            async function handleEmailLogin() {
                try {
                    const loginRequest = await axios.post('/api/auth/login', { email, password });
                    if (loginRequest.data.token) {
                        login(loginRequest.data.token, loginRequest.data.user);
                        navigate('/');
                    }
                } catch (error) {
                    setError(error.response?.data?.error || 'Failed to login');
                }
                return;
            }
            handleEmailLogin();
            return;
        }
    }

    return (
        <div className="container-fluid flex-grow-1 d-flex align-items-center justify-content-center px-4 py-5">
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

                    <div className="card border-0 shadow-lg" style={{ borderRadius: '24px', background: 'var(--bg-card)', overflow: 'hidden' }}>

                        <div className="text-center pt-5 pb-4 px-4" style={{ background: 'linear-gradient(135deg, var(--primary-100), var(--zinc-100))' }}>
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                style={{ width: '64px', height: '64px', background: 'var(--text-main)', color: 'var(--bg-body)' }}>
                                <span className="fw-bold" style={{ fontSize: '28px', letterSpacing: '-0.05em' }}>K</span>
                            </div>
                            <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.03em', color: 'var(--text-main)' }}>Welcome Back</h2>
                            <p className="mb-0" style={{ color: 'var(--text-muted)' }}>Sign in to find your next opportunity</p>
                        </div>

                        <div className="card-body p-4 p-md-5">

                            <div className="d-flex gap-2 mb-4 p-1 rounded-pill" style={{ background: 'var(--bg-surface)' }}>
                                <button type="button" onClick={() => { setLoginMethod('phone'); setOtpSent(false); }}
                                    className={`btn flex-grow-1 rounded-pill py-2 fw-medium ${loginMethod === 'phone' ? 'shadow-sm' : ''}`}
                                    style={{ background: loginMethod === 'phone' ? 'var(--bg-card)' : 'transparent', color: loginMethod === 'phone' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', transition: 'all 0.3s ease' }}>
                                    <i className="bi bi-phone me-2"></i>Phone
                                </button>
                                <button type="button" onClick={() => { setLoginMethod('email'); setOtpSent(false); }}
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

                            <form>
                                {loginMethod === 'phone' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Phone Number</label>
                                            <div className="input-group">
                                                <span className="input-group-text border-0 fw-medium" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', borderRadius: '12px 0 0 12px' }}>+91</span>
                                                <input
                                                    type="tel"
                                                    id="phone"
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
                                                    id="otp"
                                                    className="form-control border-0 py-3"
                                                    placeholder="6-digit OTP"
                                                    maxLength={6}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1.2rem', letterSpacing: '0.5em', textAlign: 'center' }} />
                                                <button type="button" className="btn btn-link p-0 mt-2 text-decoration-none" onClick={() => setOtpSent(false)} style={{ color: 'var(--primary-600)', fontSize: '0.875rem' }}>Change number</button>
                                            </div>
                                        )}
                                    </>
                                )}

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
                                                style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1rem' }} />
                                        </div>

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
                                    </>
                                )}

                                <button type="submit" className="btn w-100 py-3 fw-bold rounded-pill shadow-lg" onClick={(e) => {
                                    e.preventDefault();
                                    handleLogin();
                                }}
                                    style={{ background: 'var(--text-main)', color: 'var(--bg-body)', fontSize: '1rem', transition: 'all 0.3s ease' }}>
                                    {loginMethod === 'phone' ? (otpSent ? 'Verify & Login' : 'Send OTP') : 'Sign In'}
                                </button>
                            </form>

                            <div className="d-flex align-items-center my-4">
                                <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
                                <span className="px-3 small" style={{ color: 'var(--text-muted)' }}>or</span>
                                <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
                            </div>

                            <p className="text-center mb-0" style={{ color: 'var(--text-muted)' }}>
                                New to KaamSetu?{' '}
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