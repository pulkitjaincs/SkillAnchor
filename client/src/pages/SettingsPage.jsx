import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import PasswordCard from '../components/settings/PasswordCard';
import ContactDetailsCard from '../components/settings/ContactDetailsCard';

const cardStyle = {
    background: 'var(--bg-card)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
    overflow: 'hidden'
};

function SettingsPage() {
    const { user, updateUserData } = useAuth();

    const handlePasswordSubmit = useCallback(async (data) => {
        try {
            await authAPI.updatePassword(data);
            alert("Password updated!");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update");
            throw err;
        }
    }, []);

    const handleSendOTP = useCallback(async (payload) => {
        await authAPI.sendUpdateOTP(payload);
    }, []);

    const handleVerifyOTP = useCallback(async (payload) => {
        const { data } = await authAPI.verifyUpdateOTP(payload);
        if (data.user) updateUserData(data.user);
    }, [updateUserData]);

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
                    <div className="col-lg-6">
                        <div style={cardStyle}>
                            <PasswordCard onSubmit={handlePasswordSubmit} />
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div style={cardStyle}>
                            <ContactDetailsCard
                                user={user}
                                onSendOTP={handleSendOTP}
                                onVerifyOTP={handleVerifyOTP}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
