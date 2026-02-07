import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function SettingsPage() {
    const { user, updateUserData } = useAuth();

    const [editingSection, setEditingSection] = useState(null);
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passLoading, setPassLoading] = useState(false);
    const [contactData, setContactData] = useState({ email: '', phone: '', otp: '' });
    const [otpSent, setOtpSent] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);

    const startEditing = (field) => {
        setEditingSection(field);
        setOtpSent(false);
        setContactData({ email: '', phone: '', otp: '' });
    };

    const cancelEditing = () => {
        setEditingSection(null);
        setOtpSent(false);
        setContactData({ email: '', phone: '', otp: '' });
    };

    const handlePassChange = (e) => setPassData({ ...passData, [e.target.name]: e.target.value });
    const handleContactChange = (e) => setContactData({ ...contactData, [e.target.name]: e.target.value });

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) return alert("Passwords don't match!");
        setPassLoading(true);
        try {
            await axios.post('/api/auth/update-password', {
                currentPassword: passData.currentPassword,
                newPassword: passData.newPassword
            });
            alert("Password updated!");
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update");
        } finally {
            setPassLoading(false);
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setContactLoading(true);
        try {
            const payload = editingSection === 'email' ? { email: contactData.email } : { phone: contactData.phone };
            await axios.post('/api/auth/send-update-otp', payload);
            setOtpSent(true);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to send OTP");
        } finally {
            setContactLoading(false);
        }
    };

    const handleVerifyUpdate = async (e) => {
        e.preventDefault();
        setContactLoading(true);
        try {
            const payload = {
                otp: contactData.otp,
                ...(editingSection === 'email' ? { email: contactData.email } : { phone: contactData.phone })
            };
            const res = await axios.post('/api/auth/verify-update-otp', payload);
            if (res.data.user) updateUserData(res.data.user);
            cancelEditing();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to verify");
        } finally {
            setContactLoading(false);
        }
    };

    const inputStyle = {
        background: 'var(--bg-body)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '14px 16px',
        fontSize: '0.95rem',
        color: 'var(--text-main)',
        transition: 'all 0.2s ease'
    };

    const cardStyle = {
        background: 'var(--bg-card)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        overflow: 'hidden'
    };

    return (
        <div style={{ minHeight: '100vh', padding: '60px 20px' }}>
            <div className="container" style={{ maxWidth: '800px' }}>

                {/* Header */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center mb-4"
                        style={{
                            width: '80px', height: '80px', borderRadius: '24px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            boxShadow: '0 16px 48px rgba(59, 130, 246, 0.3)'
                        }}>
                        <i className="bi bi-gear-wide-connected text-white" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h1 className="fw-bold mb-2" style={{ fontSize: '2.25rem', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                        Account Settings
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto' }}>
                        Manage your security and contact preferences
                    </p>
                </div>

                <div className="row g-4">
                    {/* Security Card */}
                    <div className="col-lg-6">
                        <div style={cardStyle}>
                            <div style={{ padding: '28px' }}>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '16px',
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <i className="bi bi-shield-lock-fill" style={{ color: 'var(--primary-600)', fontSize: '1.3rem' }}></i>
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Password</h5>
                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Keep your account secure</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdatePassword}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small" style={{ color: 'var(--text-main)' }}>Current Password</label>
                                        <input type="password" name="currentPassword" value={passData.currentPassword} onChange={handlePassChange}
                                            style={inputStyle} className="form-control" placeholder="••••••••" required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small" style={{ color: 'var(--text-main)' }}>New Password</label>
                                        <input type="password" name="newPassword" value={passData.newPassword} onChange={handlePassChange}
                                            style={inputStyle} className="form-control" placeholder="Min 8 characters" required minLength={8} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small" style={{ color: 'var(--text-main)' }}>Confirm Password</label>
                                        <input type="password" name="confirmPassword" value={passData.confirmPassword} onChange={handlePassChange}
                                            style={inputStyle} className="form-control" placeholder="Retype password" required minLength={8} />
                                    </div>
                                    <button type="submit" disabled={passLoading}
                                        style={{
                                            width: '100%', background: 'var(--text-main)', color: 'var(--bg-body)',
                                            border: 'none', borderRadius: '14px', padding: '14px',
                                            fontWeight: 600, fontSize: '0.95rem', cursor: passLoading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}>
                                        {passLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Contact Card */}
                    <div className="col-lg-6">
                        <div style={cardStyle}>
                            <div style={{ padding: '28px' }}>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '16px',
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <i className="bi bi-person-badge-fill" style={{ color: '#10b981', fontSize: '1.3rem' }}></i>
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Contact Details</h5>
                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Email & Phone</p>
                                    </div>
                                </div>

                                {/* Email Section */}
                                <div style={{
                                    background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px', marginBottom: '16px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-envelope-fill" style={{ color: 'var(--text-muted)' }}></i>
                                            <span className="fw-semibold small" style={{ color: 'var(--text-muted)' }}>EMAIL</span>
                                        </div>
                                        {editingSection !== 'email' && (
                                            <button onClick={() => startEditing('email')}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'email' ? (
                                        <form onSubmit={otpSent ? handleVerifyUpdate : handleSendOTP}>
                                            {!otpSent ? (
                                                <>
                                                    <input type="email" name="email" value={contactData.email} onChange={handleContactChange}
                                                        style={{ ...inputStyle, marginBottom: '12px' }} className="form-control" placeholder="new@email.com" autoFocus required />
                                                    <div className="d-flex gap-2">
                                                        <button type="submit" disabled={contactLoading}
                                                            style={{ flex: 1, background: 'var(--text-main)', color: 'var(--bg-body)', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                                                            Send OTP
                                                        </button>
                                                        <button type="button" onClick={cancelEditing}
                                                            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 16px', fontWeight: 500, fontSize: '0.9rem' }}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="small mb-2" style={{ color: 'var(--primary-600)' }}>OTP sent to {contactData.email}</p>
                                                    <input type="text" name="otp" value={contactData.otp} onChange={handleContactChange} maxLength={6}
                                                        style={{ ...inputStyle, marginBottom: '12px', textAlign: 'center', letterSpacing: '4px', fontWeight: 700, fontSize: '1.2rem' }}
                                                        className="form-control" placeholder="000000" autoFocus required />
                                                    <div className="d-flex gap-2">
                                                        <button type="submit" disabled={contactLoading}
                                                            style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                                                            Verify
                                                        </button>
                                                        <button type="button" onClick={() => setOtpSent(false)}
                                                            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 16px', fontWeight: 500, fontSize: '0.9rem' }}>
                                                            Back
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </form>
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="fw-semibold" style={{ color: 'var(--text-main)', fontSize: '1rem' }}>
                                                {user?.email || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not linked</span>}
                                            </span>
                                            {user?.emailVerified && (
                                                <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <i className="bi bi-check-circle-fill me-1"></i>Verified
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Phone Section */}
                                <div style={{
                                    background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-phone-fill" style={{ color: 'var(--text-muted)' }}></i>
                                            <span className="fw-semibold small" style={{ color: 'var(--text-muted)' }}>PHONE</span>
                                        </div>
                                        {editingSection !== 'phone' && (
                                            <button onClick={() => startEditing('phone')}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'phone' ? (
                                        <form onSubmit={otpSent ? handleVerifyUpdate : handleSendOTP}>
                                            {!otpSent ? (
                                                <>
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>+91</span>
                                                        <input type="tel" name="phone" value={contactData.phone} onChange={handleContactChange} maxLength={10}
                                                            style={{ ...inputStyle, flex: 1 }} className="form-control" placeholder="9876543210" autoFocus required />
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <button type="submit" disabled={contactLoading}
                                                            style={{ flex: 1, background: 'var(--text-main)', color: 'var(--bg-body)', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                                                            Send OTP
                                                        </button>
                                                        <button type="button" onClick={cancelEditing}
                                                            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 16px', fontWeight: 500, fontSize: '0.9rem' }}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="small mb-2" style={{ color: 'var(--primary-600)' }}>OTP sent to +91 {contactData.phone}</p>
                                                    <input type="text" name="otp" value={contactData.otp} onChange={handleContactChange} maxLength={6}
                                                        style={{ ...inputStyle, marginBottom: '12px', textAlign: 'center', letterSpacing: '4px', fontWeight: 700, fontSize: '1.2rem' }}
                                                        className="form-control" placeholder="000000" autoFocus required />
                                                    <div className="d-flex gap-2">
                                                        <button type="submit" disabled={contactLoading}
                                                            style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                                                            Verify
                                                        </button>
                                                        <button type="button" onClick={() => setOtpSent(false)}
                                                            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 16px', fontWeight: 500, fontSize: '0.9rem' }}>
                                                            Back
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </form>
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="fw-semibold" style={{ color: 'var(--text-main)', fontSize: '1rem' }}>
                                                {user?.phone ? `+91 ${user.phone}` : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not linked</span>}
                                            </span>
                                            {user?.phoneVerified && (
                                                <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <i className="bi bi-check-circle-fill me-1"></i>Verified
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
