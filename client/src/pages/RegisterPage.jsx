import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/ui/useRegister';
import '../styles/AuthPages.css';

function RegisterPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const {
        role, setRole,
        registerMethod, setRegisterMethod,
        otpSent, setOtpSent,
        name, setName,
        phone, setPhone,
        otp, setOtp,
        email, setEmail,
        password, setPassword,
        error, loading,
        handleRegister
    } = useRegister();

    useEffect(() => {
        if (user) {
            navigate('/');
            return;
        }
    }, [user, navigate]);

    return (
        <div className="container-fluid auth-page-container flex-grow-1 d-flex align-items-center justify-content-center px-4 py-5">
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

                    <div className="card border-0 shadow-lg auth-card">

                        <div className="text-center pt-5 pb-4 px-4 auth-header">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 auth-header-icon">
                                <span className="fw-bold fs-3">S</span>
                            </div>
                            <h2 className="fw-bold mb-1 auth-header-title">Join SkillAnchor</h2>
                            <p className="mb-0 auth-header-subtitle">Create your account to get started</p>
                        </div>

                        <div className="card-body p-4 p-md-5">

                            <div className="mb-4">
                                <label className="form-label fw-medium small text-uppercase auth-form-label">I am a</label>
                                <div className="d-flex gap-3">
                                    <div onClick={() => setRole('worker')}
                                        className={`flex-grow-1 p-3 rounded-4 text-center role-selector-card ${role === 'worker' ? 'active' : ''}`}>
                                        <i className={`bi bi-person-badge fs-3 d-block mb-2 role-icon ${role === 'worker' ? 'active' : ''}`}></i>
                                        <span className={`fw-semibold role-text ${role === 'worker' ? 'active' : ''}`}>Job Seeker</span>
                                    </div>
                                    <div onClick={() => setRole('employer')}
                                        className={`flex-grow-1 p-3 rounded-4 text-center role-selector-card ${role === 'employer' ? 'active' : ''}`}>
                                        <i className={`bi bi-building fs-3 d-block mb-2 role-icon ${role === 'employer' ? 'active' : ''}`}></i>
                                        <span className={`fw-semibold role-text ${role === 'employer' ? 'active' : ''}`}>Employer</span>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex gap-2 mb-4 p-1 rounded-pill auth-toggle-group">
                                <button type="button" onClick={() => setRegisterMethod('phone')}
                                    className={`btn flex-grow-1 rounded-pill py-2 fw-medium auth-toggle-btn ${registerMethod === 'phone' ? 'active shadow-sm' : ''}`}>
                                    <i className="bi bi-phone me-2"></i>Phone
                                </button>
                                <button type="button" onClick={() => setRegisterMethod('email')}
                                    className={`btn flex-grow-1 rounded-pill py-2 fw-medium auth-toggle-btn ${registerMethod === 'email' ? 'active shadow-sm' : ''}`}>
                                    <i className="bi bi-envelope me-2"></i>Email
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-2 auth-error-box">
                                    <i className="bi bi-exclamation-circle auth-error-icon"></i>
                                    <span className="small fw-medium auth-error-text">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleRegister}>
                                <div className="mb-4">
                                    <label className="form-label fw-medium small text-uppercase auth-form-label">Full Name</label>
                                    <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="form-control border-0 py-3 auth-form-control" placeholder="Enter your full name" />
                                </div>

                                {registerMethod === 'phone' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase auth-form-label">Phone Number</label>
                                            <div className="input-group">
                                                <span className="input-group-text border-0 fw-medium auth-input-group-text">+91</span>
                                                <input type="tel" id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} disabled={otpSent} className="form-control border-0 py-3 auth-form-control auth-form-control-phone" placeholder="Enter your phone number" />
                                            </div>
                                        </div>

                                        {otpSent && (
                                            <div className="mb-4">
                                                <label className="form-label fw-medium small text-uppercase auth-form-label">Enter OTP</label>
                                                <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="form-control border-0 py-3 auth-form-control auth-otp-input" placeholder="6-digit OTP" maxLength={6} />
                                                <button type="button" className="btn btn-link p-0 mt-2 text-decoration-none auth-link fs-sm" onClick={() => setOtpSent(false)}>Change number</button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {registerMethod === 'email' && (
                                    <>
                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase auth-form-label">Email Address</label>
                                            <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control border-0 py-3 auth-form-control" placeholder="you@example.com" />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-medium small text-uppercase auth-form-label">Password</label>
                                            <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control border-0 py-3 auth-form-control" placeholder="Create a password" />
                                        </div>
                                    </>
                                )}

                                <button type="submit" className="btn w-100 py-3 fw-bold rounded-pill shadow-lg auth-submit-btn" disabled={loading}>
                                    {loading ? 'Please wait...' : (registerMethod === 'phone' ? (otpSent ? 'Verify & Register' : 'Send OTP') : 'Create Account')}
                                </button>
                            </form>

                            <div className="d-flex align-items-center my-4">
                                <hr className="flex-grow-1 auth-hr" />
                                <span className="px-3 small auth-text-muted">or</span>
                                <hr className="flex-grow-1 auth-hr" />
                            </div>

                            <p className="text-center mb-0 auth-text-muted">
                                Already have an account?{' '}
                                <Link to="/login" className="fw-semibold text-decoration-none auth-text-main">Sign in</Link>
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
        </div >
    );
}

export default RegisterPage;