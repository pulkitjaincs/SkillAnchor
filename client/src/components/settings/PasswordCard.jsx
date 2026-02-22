import { useState, useCallback, memo } from 'react';

const inputStyle = {
    background: 'var(--bg-body)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '0.95rem',
    color: 'var(--text-main)',
    transition: 'all 0.2s ease'
};

const submitBtnBase = {
    width: '100%', border: 'none', borderRadius: '14px', padding: '14px',
    fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s ease'
};

const PasswordCard = memo(({ onSubmit }) => {
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passLoading, setPassLoading] = useState(false);

    const handlePassChange = useCallback((e) => {
        const { name, value } = e.target;
        setPassData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleUpdatePassword = useCallback(async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) return alert("Passwords don't match!");
        setPassLoading(true);
        try {
            await onSubmit({ currentPassword: passData.currentPassword, newPassword: passData.newPassword });
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } finally {
            setPassLoading(false);
        }
    }, [passData, onSubmit]);

    return (
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
                    style={{ ...submitBtnBase, background: 'var(--text-main)', color: 'var(--bg-body)', cursor: passLoading ? 'not-allowed' : 'pointer' }}>
                    {passLoading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
});

export default PasswordCard;
