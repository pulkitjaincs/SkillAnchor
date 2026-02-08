import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function ForgotPasswordPage() {
    const [method, setMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (method === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address');
                return;
            }
        } else {
            if (phone.length !== 10) {
                setError('Please enter a valid 10-digit phone number');
                return;
            }
        }

        setLoading(true);
        try {
            const payload = method === 'email' ? { email } : { phone };
            await authAPI.forgotPassword(payload);
            setSuccess('OTP sent!');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const payload = method === 'email'
                ? { email, otp, newPassword }
                : { phone, otp, newPassword };
            await authAPI.resetPassword(payload);
            setSuccess('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid flex-grow-1 d-flex align-items-center justify-content-center px-4 py-5">
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

                    <div className="card border-0 shadow-lg" style={{ borderRadius: '24px', background: 'var(--bg-card)', overflow: 'hidden' }}>

                        <div className="text-center pt-5 pb-4 px-4" style={{ background: 'linear-gradient(135deg, var(--primary-100), var(--zinc-100))' }}>
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                style={{ width: '64px', height: '64px', background: 'var(--text-main)', color: 'var(--bg-body)' }}>
                                <i className="bi bi-key" style={{ fontSize: '28px' }}></i>
                            </div>
                            <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
                                {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                            </h2>
                            <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
                                {step === 1 ? "We'll send you an OTP to reset it" : 'Enter OTP and your new password'}
                            </p>
                        </div>

                        <div className="card-body p-4 p-md-5">

                            {step === 1 && (
                                <div className="d-flex gap-2 mb-4 p-1 rounded-pill" style={{ background: 'var(--bg-surface)' }}>
                                    <button type="button" onClick={() => setMethod('phone')}
                                        className={`btn flex-grow-1 rounded-pill py-2 fw-medium ${method === 'phone' ? 'shadow-sm' : ''}`}
                                        style={{ background: method === 'phone' ? 'var(--bg-card)' : 'transparent', color: method === 'phone' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', transition: 'all 0.3s ease' }}>
                                        <i className="bi bi-phone me-2"></i>Phone
                                    </button>
                                    <button type="button" onClick={() => setMethod('email')}
                                        className={`btn flex-grow-1 rounded-pill py-2 fw-medium ${method === 'email' ? 'shadow-sm' : ''}`}
                                        style={{ background: method === 'email' ? 'var(--bg-card)' : 'transparent', color: method === 'email' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', transition: 'all 0.3s ease' }}>
                                        <i className="bi bi-envelope me-2"></i>Email
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                    <i className="bi bi-exclamation-circle" style={{ color: '#ef4444' }}></i>
                                    <span className="small fw-medium" style={{ color: '#ef4444' }}>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-2" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                    <i className="bi bi-check-circle" style={{ color: '#22c55e' }}></i>
                                    <span className="small fw-medium" style={{ color: '#22c55e' }}>{success}</span>
                                </div>
                            )}

                            {step === 1 ? (
                                <form onSubmit={handleSendOtp}>
                                    {method === 'email' ? (
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
                                    ) : (
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
                                                    style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '0 12px 12px 0', fontSize: '1rem' }} />
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" className="btn w-100 py-3 fw-bold rounded-pill shadow-lg" disabled={loading}
                                        style={{ background: 'var(--text-main)', color: 'var(--bg-body)', fontSize: '1rem', transition: 'all 0.3s ease' }}>
                                        {loading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleResetPassword}>
                                    <div className="mb-3 p-3 rounded-3 d-flex align-items-center justify-content-between" style={{ background: 'var(--bg-surface)' }}>
                                        <strong style={{ color: 'var(--text-main)' }}>{method === 'email' ? email : `+91 ${phone}`}</strong>
                                        <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={() => { setStep(1); setSuccess(''); setError(''); }} style={{ color: 'var(--primary-600)', fontSize: '0.875rem' }}>
                                            Change
                                        </button>
                                    </div>

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
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>New Password</label>
                                        <input
                                            type="password"
                                            className="form-control border-0 py-3"
                                            placeholder="At least 8 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1rem' }} />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-medium small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control border-0 py-3"
                                            placeholder="Re-enter password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1rem' }} />
                                    </div>

                                    <button type="submit" className="btn w-100 py-3 fw-bold rounded-pill shadow-lg" disabled={loading}
                                        style={{ background: 'var(--text-main)', color: 'var(--bg-body)', fontSize: '1rem', transition: 'all 0.3s ease' }}>
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>
                            )}

                            <div className="d-flex align-items-center my-4">
                                <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
                                <span className="px-3 small" style={{ color: 'var(--text-muted)' }}>or</span>
                                <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
                            </div>

                            <p className="text-center mb-0" style={{ color: 'var(--text-muted)' }}>
                                Remember your password?{' '}
                                <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'var(--text-main)' }}>Sign in</Link>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
