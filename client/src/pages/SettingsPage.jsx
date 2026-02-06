import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function SettingsPage() {
    const { user, updateUserData } = useAuth();

    // UI State
    const [editingSection, setEditingSection] = useState(null); // 'email', 'phone', or null

    // Password State
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passLoading, setPassLoading] = useState(false);

    // Contact State
    const [contactData, setContactData] = useState({ email: '', phone: '', otp: '' });
    const [otpSent, setOtpSent] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);

    // Handlers
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

    // 1. Update Password
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) return alert("New passwords do not match!");
        setPassLoading(true);
        try {
            await axios.post('/api/auth/update-password', {
                currentPassword: passData.currentPassword,
                newPassword: passData.newPassword
            });
            alert("Password updated successfully!");
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update password");
        } finally {
            setPassLoading(false);
        }
    };

    // 2. Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setContactLoading(true);
        try {
            const payload = editingSection === 'email' ? { email: contactData.email } : { phone: contactData.phone };
            await axios.post('/api/auth/send-update-otp', payload);
            setOtpSent(true);
            alert(`OTP sent to your new ${editingSection}`);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to send OTP");
        } finally {
            setContactLoading(false);
        }
    };

    // 3. Verify OTP & Update
    const handleVerifyUpdate = async (e) => {
        e.preventDefault();
        setContactLoading(true);
        try {
            const payload = {
                otp: contactData.otp,
                ...(editingSection === 'email' ? { email: contactData.email } : { phone: contactData.phone })
            };

            const res = await axios.post('/api/auth/verify-update-otp', payload);
            if (res.data.user) {
                updateUserData(res.data.user);
            }
            alert(`${editingSection === 'email' ? 'Email' : 'Phone'} updated successfully!`);
            cancelEditing();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to verify OTP");
        } finally {
            setContactLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-5 animate-entry-listing">
                <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-3 shadow-sm"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                    <i className="bi bi-gear-wide-connected fs-4 text-primary"></i>
                </div>
                <h2 className="fw-bold mb-2">Account Settings</h2>
                <p className="text-muted">Manage your security preferences and contact details</p>
            </div>

            <div className="row g-4 justify-content-center">
                {/* 1. Security Card (Password) */}
                <div className="col-lg-5 animate-entry-listing stagger-1">
                    <div className="card border-0 shadow-lg h-100 card-hover-effect" style={{ borderRadius: '24px', background: 'var(--bg-card)' }}>
                        <div className="card-body p-4 p-lg-5">
                            <div className="d-flex align-items-center mb-4">
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-600)' }}>
                                    <i className="bi bi-shield-lock-fill fs-5"></i>
                                </div>
                                <h5 className="fw-bold mb-0">Password Security</h5>
                            </div>

                            <form onSubmit={handleUpdatePassword}>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-uppercase text-muted">Current Password</label>
                                    <input type="password" name="currentPassword" className="form-control premium-input py-3" required
                                        value={passData.currentPassword} onChange={handlePassChange} placeholder="••••••••" />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-uppercase text-muted">New Password</label>
                                    <input type="password" name="newPassword" className="form-control premium-input py-3" required minLength={8}
                                        value={passData.newPassword} onChange={handlePassChange} placeholder="Min 8 characters" />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-uppercase text-muted">Confirm Password</label>
                                    <input type="password" name="confirmPassword" className="form-control premium-input py-3" required minLength={8}
                                        value={passData.confirmPassword} onChange={handlePassChange} placeholder="Retype new password" />
                                </div>
                                <button type="submit" className="btn btn-primary-gradient w-100 fw-bold py-3 rounded-pill shadow-sm" disabled={passLoading}>
                                    {passLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</> : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* 2. Contact Card (Email & Phone) */}
                <div className="col-lg-5 animate-entry-listing stagger-2">
                    <div className="card border-0 shadow-lg h-100 card-hover-effect" style={{ borderRadius: '24px', background: 'var(--bg-card)' }}>
                        <div className="card-body p-4 p-lg-5">
                            <div className="d-flex align-items-center mb-4">
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                    <i className="bi bi-person-badge-fill fs-5"></i>
                                </div>
                                <h5 className="fw-bold mb-0">Contact Details</h5>
                            </div>

                            {/* Email Section */}
                            <div className="mb-4 p-4 rounded-4 settings-card-inner">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-envelope text-muted"></i>
                                        <span className="fw-bold small text-uppercase text-muted">Email Address</span>
                                    </div>
                                    {editingSection !== 'email' && (
                                        <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold border" onClick={() => startEditing('email')}>Edit</button>
                                    )}
                                </div>

                                {editingSection === 'email' ? (
                                    <form onSubmit={otpSent ? handleVerifyUpdate : handleSendOTP} className="animate-entry-listing">
                                        {!otpSent ? (
                                            <>
                                                <input type="email" name="email" className="form-control premium-input mb-3" required
                                                    value={contactData.email} onChange={handleContactChange} placeholder="new@email.com" autoFocus />
                                                <div className="d-flex gap-2">
                                                    <button type="submit" className="btn btn-dark btn-sm rounded-pill px-3 flex-grow-1" disabled={contactLoading}>Send OTP</button>
                                                    <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={cancelEditing}>Cancel</button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-center mb-3">
                                                    <span className="badge bg-primary-subtle text-primary mb-2">OTP Sent</span>
                                                    <p className="small text-muted mb-0">Check {contactData.email}</p>
                                                </div>
                                                <input type="text" name="otp" className="form-control premium-input mb-3 text-center letter-spacing-2 fw-bold fs-5" required maxLength={6}
                                                    value={contactData.otp} onChange={handleContactChange} placeholder="000000" autoFocus />
                                                <div className="d-flex gap-2">
                                                    <button type="submit" className="btn btn-primary-gradient btn-sm rounded-pill px-3 flex-grow-1" disabled={contactLoading}>Verify</button>
                                                    <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => setOtpSent(false)}>Back</button>
                                                </div>
                                            </>
                                        )}
                                    </form>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-between">
                                        <p className="mb-0 fw-bold text-break d-flex align-items-center gap-2 fs-5">
                                            {user?.email || <span className="text-muted fw-normal fst-italic fs-6">Not linked</span>}
                                        </p>
                                        {user?.authType === 'email' && <span className="badge bg-success-subtle text-success rounded-pill px-3">Verified</span>}
                                    </div>
                                )}
                            </div>

                            {/* Phone Section */}
                            <div className="p-4 rounded-4 settings-card-inner">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-phone text-muted"></i>
                                        <span className="fw-bold small text-uppercase text-muted">Phone Number</span>
                                    </div>
                                    {editingSection !== 'phone' && (
                                        <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold border" onClick={() => startEditing('phone')}>Edit</button>
                                    )}
                                </div>

                                {editingSection === 'phone' ? (
                                    <form onSubmit={otpSent ? handleVerifyUpdate : handleSendOTP} className="animate-entry-listing">
                                        {!otpSent ? (
                                            <>
                                                <div className="input-group mb-3">
                                                    <span className="input-group-text border-end-0 bg-transparent text-muted">+91</span>
                                                    <input type="tel" name="phone" className="form-control premium-input border-start-0 ps-0" required maxLength={10}
                                                        value={contactData.phone} onChange={handleContactChange} placeholder="9876543210" autoFocus />
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button type="submit" className="btn btn-dark btn-sm rounded-pill px-3 flex-grow-1" disabled={contactLoading}>Send OTP</button>
                                                    <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={cancelEditing}>Cancel</button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-center mb-3">
                                                    <span className="badge bg-primary-subtle text-primary mb-2">OTP Sent</span>
                                                    <p className="small text-muted mb-0">Check +91 {contactData.phone}</p>
                                                </div>
                                                <input type="text" name="otp" className="form-control premium-input mb-3 text-center letter-spacing-2 fw-bold fs-5" required maxLength={6}
                                                    value={contactData.otp} onChange={handleContactChange} placeholder="000000" autoFocus />
                                                <div className="d-flex gap-2">
                                                    <button type="submit" className="btn btn-primary-gradient btn-sm rounded-pill px-3 flex-grow-1" disabled={contactLoading}>Verify</button>
                                                    <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => setOtpSent(false)}>Back</button>
                                                </div>
                                            </>
                                        )}
                                    </form>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-between">
                                        <p className="mb-0 fw-bold d-flex align-items-center gap-2 fs-5">
                                            {user?.phone ? `+91 ${user.phone}` : <span className="text-muted fw-normal fst-italic fs-6">Not linked</span>}
                                        </p>
                                        {user?.authType === 'phone' && <span className="badge bg-success-subtle text-success rounded-pill px-3">Verified</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
