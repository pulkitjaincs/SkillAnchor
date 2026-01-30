import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [role, setRole] = useState('worker');
    const [registerMethod, setRegisterMethod] = useState('phone');
    const [otpSent, setOtpSent] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
            return;
        }
    }, [user]);
    const handleRegister = () => {
        setError('');
        if (name.length < 3) {
            setError('Name must be at least 3 characters long');
            return;
        }
        if (registerMethod === 'phone') {
            if (phone.length !== 10) {
                setError('Please enter a valid 10-digit phone number');
                return;
            }
            if (!otpSent) {
                async function sendOtp() {
                    try {
                        const sendOtpRequest = await axios.post('/api/auth/send-otp', { phone, role });
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
                    const verifyOtpRequest = await axios.post('/api/auth/verify-otp', { phone, role, name, otp });
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
        if (registerMethod === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address');
                return;
            }
            if (!password) {
                setError('Please enter your password');
                return;
            }
            async function register() {
                try {
                    const registerRequest = await axios.post('/api/auth/register', { email, role, name, password });
                    if (registerRequest.data.token) {
                        login(registerRequest.data.token, registerRequest.data.user);
                        navigate('/');
                    }
                } catch (error) {
                    setError(error.response?.data?.error || 'Failed to register');
                }
                return;
            }
            register();
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
                            <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.03em', color: 'var(--text-main)' }}>Join KaamSetu</h2>
                            <p className="mb-0" style={{ color: 'var(--text-muted)' }}>Create your account to get started</p>
                        </div>

                        <div className="card-body p-4 p-md-5">

                            <div className="mb-4">
                                <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>I am a</label>
                                <div className="d-flex gap-3">
                                    <div onClick={() => setRole('worker')}
                                        className={`flex-grow-1 p-3 rounded-4 text-center cursor-pointer`}
                                        style={{ background: role === 'worker' ? 'var(--primary-100)' : 'var(--bg-surface)', border: role === 'worker' ? '2px solid var(--primary-600)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                                        <i className="bi bi-person-badge fs-3 d-block mb-2" style={{ color: role === 'worker' ? 'var(--primary-600)' : 'var(--text-muted)' }}></i>
                                        <span className="fw-semibold" style={{ color: role === 'worker' ? 'var(--text-main)' : 'var(--text-muted)' }}>Job Seeker</span>
                                    </div>
                                    <div onClick={() => setRole('employer')}
                                        className={`flex-grow-1 p-3 rounded-4 text-center cursor-pointer`}
                                        style={{ background: role === 'employer' ? 'var(--primary-100)' : 'var(--bg-surface)', border: role === 'employer' ? '2px solid var(--primary-600)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                                        <i className="bi bi-building fs-3 d-block mb-2" style={{ color: role === 'employer' ? 'var(--primary-600)' : 'var(--text-muted)' }}></i>
                                        <span className="fw-semibold" style={{ color: role === 'employer' ? 'var(--text-main)' : 'var(--text-muted)' }}>Employer</span>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex gap-2 mb-4 p-1 rounded-pill" style={{ background: 'var(--bg-surface)' }}>
                                <button type="button" onClick={() => setRegisterMethod('phone')}
                                    className={`btn flex-grow-1 rounded-pill py-2 fw-medium ${registerMethod === 'phone' ? 'shadow-sm' : ''}`}
                                    style={{ background: registerMethod === 'phone' ? 'var(--bg-card)' : 'transparent', color: registerMethod === 'phone' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', transition: 'all 0.3s ease' }}>
                                    <i className="bi bi-phone me-2"></i>Phone
                                </button>
                                <button type="button" onClick={() => setRegisterMethod('email')}
                                    className={`btn flex-grow-1 rounded-pill py-2 fw-medium ${registerMethod === 'email' ? 'shadow-sm' : ''}`}
                                    style={{ background: registerMethod === 'email' ? 'var(--bg-card)' : 'transparent', color: registerMethod === 'email' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', transition: 'all 0.3s ease' }}>
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
                                <div className="mb-4">
                                    <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Full Name</label>
                                    <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="form-control border-0 py-3" placeholder="Enter your full name"
                                        style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1rem' }} />
                                </div>

                                {registerMethod === 'phone' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Phone Number</label>
                                            <div className="input-group">
                                                <span className="input-group-text border-0 fw-medium" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', borderRadius: '12px 0 0 12px' }}>+91</span>
                                                <input type="tel" id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} disabled={otpSent} className="form-control border-0 py-3" placeholder="Enter your phone number"
                                                    style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '0 12px 12px 0', fontSize: '1rem' }} />
                                            </div>
                                        </div>

                                        {otpSent && (
                                            <div className="mb-4">
                                                <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Enter OTP</label>
                                                <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="form-control border-0 py-3" placeholder="6-digit OTP" maxLength={6}
                                                    style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1.2rem', letterSpacing: '0.5em', textAlign: 'center' }} />
                                                <button type="button" className="btn btn-link p-0 mt-2 text-decoration-none" onClick={() => setOtpSent(false)} style={{ color: 'var(--primary-600)', fontSize: '0.875rem' }}>Change number</button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {registerMethod === 'email' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Email Address</label>
                                            <input type="email" id="email" name="email" onChange={(e) => setEmail(e.target.value)} className="form-control border-0 py-3" placeholder="you@example.com"
                                                style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1rem' }} />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Password</label>
                                            <input type="password" id="password" name="password" onChange={(e) => setPassword(e.target.value)} className="form-control border-0 py-3" placeholder="Create a password"
                                                style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1rem' }} />
                                        </div>
                                    </>
                                )}

                                <button type="submit" className="btn w-100 py-3 fw-bold rounded-pill shadow-lg"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRegister();
                                    }}
                                    style={{ background: 'var(--text-main)', color: 'var(--bg-body)', fontSize: '1rem', transition: 'all 0.3s ease' }}>
                                    {registerMethod === 'phone' ? (otpSent ? 'Verify & Register' : 'Send OTP') : 'Create Account'}
                                </button>
                            </form>

                            <div className="d-flex align-items-center my-4">
                                <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
                                <span className="px-3 small" style={{ color: 'var(--text-muted)' }}>or</span>
                                <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
                            </div>

                            <p className="text-center mb-0" style={{ color: 'var(--text-muted)' }}>
                                Already have an account?{' '}
                                <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'var(--text-main)' }}>Sign in</Link>
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
        </div >
    );
}

export default RegisterPage;