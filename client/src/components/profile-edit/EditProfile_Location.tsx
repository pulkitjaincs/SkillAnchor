import { InputField } from '@/components/common/FormComponents';

interface LocationFormData { city?: string; state?: string; pincode?: string; }
export default function EditProfile_Location({ formData, handleChange, navigate }: { formData: LocationFormData; handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; navigate: (path: string) => void }) {
    return (
        <div>
            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Where are you located?</h4>

            <div className="d-flex align-items-center justify-content-between mb-4 p-3"
                style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div className="d-flex align-items-center gap-3">
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-shield-lock-fill" style={{ color: 'var(--primary-600)' }}></i>
                    </div>
                    <div>
                        <p className="mb-0 fw-semibold" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Contact Details</p>
                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Manage in Account Settings</p>
                    </div>
                </div>
                <button type="button" onClick={() => navigate('/profile/settings')}
                    className="btn btn-sm fw-semibold" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 16px' }}>
                    Manage
                </button>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-6">
                    <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" />
                </div>
                <div className="col-6">
                    <InputField label="State" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Maharashtra" />
                </div>
            </div>

            <div className="col-6">
                <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} placeholder="e.g. 400001" />
            </div>
        </div>
    );
}
