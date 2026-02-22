import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogin } from '../hooks/ui/useLogin';
import '../styles/AuthPages.css';

function LoginPage() {
    const { user } = useAuth();
    const {
        loginMethod, setLoginMethod,
        emailMethod, setEmailMethod,
        otpSent, setOtpSent,
        phone, setPhone,
        otp, setOtp,
        email, setEmail,
        password, setPassword,
        error, loading,
        resetState, handleLogin, getButtonText, redirect, navigate
    } = useLogin();

    useEffect(() => {
        if (user) {
            navigate(redirect);
            return;
        }
    }, [user, navigate, redirect]);

    return (
        <div className="container-fluid auth-page-container d-flex align-items-center justify-content-center px-4 py-5">
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

                    <div className="card border-0 shadow-lg auth-card">

                        <div className="text-center pt-5 pb-4 px-4 auth-header">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 auth-header-icon">
                                <span className="fw-bold fs-3">S</span>
                            </div>
                            <h2 className="fw-bold mb-1 auth-header-title">Welcome Back</h2>
                            <p className="mb-0 auth-header-subtitle">Sign in to find your next opportunity</p>
                        </div>

                        <div className="card-body p-4 p-md-5">

                            {/* Phone / Email Toggle */}
                            <div className="d-flex gap-2 mb-4 p-1 rounded-pill auth-toggle-group">
                                <button type="button" onClick={() => { setLoginMethod('phone'); resetState(); }}
                                    className={`btn flex-grow-1 rounded-pill py-2 fw-medium auth-toggle-btn ${loginMethod === 'phone' ? 'active shadow-sm' : ''}`}>
                                    <i className="bi bi-phone me-2"></i>Phone
                                </button>
                                <button type="button" onClick={() => { setLoginMethod('email'); resetState(); }}
                                    className={`btn flex-grow-1 rounded-pill py-2 fw-medium auth-toggle-btn ${loginMethod === 'email' ? 'active shadow-sm' : ''}`}>
                                    <i className="bi bi-envelope me-2"></i>Email
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-2 auth-error-box">
                                    <i className="bi bi-exclamation-circle auth-error-icon"></i>
                                    <span className="small fw-medium auth-error-text">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleLogin}>
                                {/* Phone OTP Login */}
                                {loginMethod === 'phone' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase auth-form-label">Phone Number</label>
                                            <div className="input-group">
                                                <span className="input-group-text border-0 fw-medium auth-input-group-text">+91</span>
                                                <input
                                                    type="tel"
                                                    className="form-control border-0 py-3 auth-form-control auth-form-control-phone"
                                                    placeholder="Enter your phone number"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    disabled={otpSent}
                                                />
                                            </div>
                                        </div>

                                        {otpSent && (
                                            <div className="mb-4">
                                                <label className="form-label fw-medium small text-uppercase auth-form-label">Enter OTP</label>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 py-3 auth-form-control auth-otp-input"
                                                    placeholder="6-digit OTP"
                                                    maxLength={6}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                />
                                                <button type="button" className="btn btn-link p-0 mt-2 text-decoration-none auth-link fs-sm" onClick={resetState}>Change number</button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Email Login */}
                                {loginMethod === 'email' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase auth-form-label">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-control border-0 py-3 auth-form-control"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={otpSent}
                                            />
                                        </div>

                                        {/* Password / OTP sub-toggle */}
                                        {!otpSent && (
                                            <div className="d-flex gap-2 mb-4">
                                                <button type="button" onClick={() => { setEmailMethod('password'); setOtp(''); }}
                                                    className={`btn flex-grow-1 py-2 fw-medium rounded-3 auth-sub-toggle-btn ${emailMethod === 'password' ? 'active' : ''}`}>
                                                    <i className="bi bi-lock me-1"></i>Password
                                                </button>
                                                <button type="button" onClick={() => { setEmailMethod('otp'); setPassword(''); }}
                                                    className={`btn flex-grow-1 py-2 fw-medium rounded-3 auth-sub-toggle-btn ${emailMethod === 'otp' ? 'active' : ''}`}>
                                                    <i className="bi bi-shield-lock me-1"></i>OTP
                                                </button>
                                            </div>
                                        )}

                                        {/* Password input */}
                                        {emailMethod === 'password' && (
                                            <div className="mb-4">
                                                <label className="form-label fw-medium small text-uppercase d-flex justify-content-between auth-form-label">
                                                    Password
                                                    <Link to="/forgot-password" className="text-decoration-none auth-link" style={{ textTransform: 'none', letterSpacing: 'normal' }}>Forgot?</Link>
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control border-0 py-3 auth-form-control"
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        {/* Email OTP input */}
                                        {emailMethod === 'otp' && otpSent && (
                                            <div className="mb-4">
                                                <label className="form-label fw-medium small text-uppercase auth-form-label">Enter OTP</label>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 py-3 auth-form-control auth-otp-input"
                                                    placeholder="6-digit OTP"
                                                    maxLength={6}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                />
                                                <button type="button" className="btn btn-link p-0 mt-2 text-decoration-none auth-link fs-sm" onClick={resetState}>Change email</button>
                                            </div>
                                        )}
                                    </>
                                )}

                                <button type="submit" className="btn w-100 py-3 fw-bold rounded-pill shadow-lg auth-submit-btn" disabled={loading}>
                                    {loading ? 'Please wait...' : getButtonText()}
                                </button>
                            </form>

                            <div className="d-flex align-items-center my-4">
                                <hr className="flex-grow-1 auth-hr" />
                                <span className="px-3 small auth-text-muted">or</span>
                                <hr className="flex-grow-1 auth-hr" />
                            </div>

                            <p className="text-center mb-0 auth-text-muted">
                                New to SkillAnchor?{' '}
                                <Link to="/register" className="fw-semibold text-decoration-none auth-text-main">Create an account</Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-center mt-4 small auth-text-muted">
                        By continuing, you agree to our{' '}
                        <Link to="/terms" className="text-decoration-none auth-text-main">Terms</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-decoration-none auth-text-main">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;