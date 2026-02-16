import { InputField, SelectField } from '../common/FormComponents';

function EditProfile_Basics({ formData, handleChange, user, isEmployer, avatar, uploadingAvatar, handleAvatarUpload, fileInputRef, navigate }) {
    return (
        <div>
            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>
                {isEmployer ? 'Your profile details' : "Let's start with basics"}
            </h4>

            <div className="mb-4 d-flex align-items-center gap-4">
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: '88px', height: '88px', borderRadius: '50%',
                        background: avatar ? `url(${avatar}) center/cover` : 'linear-gradient(135deg, var(--primary-500), #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
                        border: '3px solid var(--bg-card)'
                    }}>
                        {!avatar && <span style={{ color: 'white', fontSize: '2rem', fontWeight: 700 }}>{formData.name?.charAt(0)?.toUpperCase() || '?'}</span>}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} />
                </div>
                <div>
                    <p className="mb-2 fw-semibold" style={{ color: 'var(--text-main)' }}>Profile Photo</p>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
                        style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                            borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500,
                            color: 'var(--text-main)', cursor: 'pointer'
                        }}>
                        {uploadingAvatar ? <><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</> : <><i className="bi bi-camera me-2"></i>Upload Photo</>}
                    </button>
                </div>
            </div>

            <InputField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
            />


            <div className="mb-4">
                <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    Phone Number
                    {user?.phoneVerified ? (
                        <span className="badge bg-success-subtle text-success ms-2 rounded-pill">
                            <i className="bi bi-patch-check-fill me-1"></i>Verified
                        </span>
                    ) : (
                        <button type="button" onClick={() => navigate('/profile/settings')}
                            className="btn btn-link btn-sm text-decoration-none p-0 ms-2" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                            Verify Now
                        </button>
                    )}
                </label>
                <div className="d-flex align-items-center gap-2">
                    <input type="tel" value={user?.phone || ''} readOnly
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-main)', cursor: 'not-allowed' }}
                        className="form-control" placeholder="Not set" />
                    <button type="button" onClick={() => navigate('/profile/settings')}
                        className="btn btn-outline-secondary" style={{ borderRadius: '12px', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 500 }}>
                        <i className="bi bi-gear me-1"></i>Change
                    </button>
                </div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Phone can only be changed via Account Settings with OTP verification</small>
            </div>

            {isEmployer ? (
                <>
                    <InputField
                        label="WhatsApp Number"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        type="tel"
                        maxLength={10}
                        icon="bi-whatsapp"
                        placeholder="10-digit number (optional)"
                    />

                    <InputField
                        label="Designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g. HR Manager, Recruiter"
                    />


                    <div className="mb-4">
                        <div className="form-check" style={{ paddingLeft: '2rem' }}>
                            <input type="checkbox" className="form-check-input" id="isHiringManager"
                                checked={formData.isHiringManager}
                                onChange={(e) => handleChange({ target: { name: 'isHiringManager', value: e.target.checked } })}
                                style={{ width: '20px', height: '20px', marginRight: '12px' }} />
                            <label className="form-check-label fw-semibold" htmlFor="isHiringManager" style={{ color: 'var(--text-main)' }}>
                                I am a Hiring Manager
                            </label>
                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Check if you directly handle hiring decisions</p>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="row g-3 mb-4">
                        <div className="col-6">
                            <SelectField
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                options={[
                                    { label: 'Male', value: 'male' },
                                    { label: 'Female', value: 'female' },
                                    { label: 'Other', value: 'other' }
                                ]}
                            />
                        </div>
                        <div className="col-6">
                            <InputField
                                label="Date of Birth"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <InputField
                        label="WhatsApp Number"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        type="tel"
                        maxLength={10}
                        icon="bi-whatsapp"
                        placeholder="10-digit number"
                    />
                </>
            )}
        </div>
    );
}

export default EditProfile_Basics;
