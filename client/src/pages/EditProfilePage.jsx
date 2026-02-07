import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EditProfilePage() {
    const navigate = useNavigate();
    const { updateUserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const [avatar, setAvatar] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        dob: '',
        phone: '',
        whatsapp: '',
        email: '',
        city: '',
        state: '',
        pincode: '',
        bio: '',
        languages: '',
        skills: '',
        expectedSalaryMin: '',
        expectedSalaryMax: '',
        expectedSalaryType: 'monthly',
        aadhaarNumber: '',
        panNumber: '',
        licenseNumber: ''
    });

    const steps = [
        { number: 1, title: 'Basics', icon: 'bi-person-fill', desc: 'Name & identity' },
        { number: 2, title: 'Location', icon: 'bi-geo-alt-fill', desc: 'Where you are' },
        { number: 3, title: 'Skills', icon: 'bi-stars', desc: 'What you do' },
        { number: 4, title: 'Finish', icon: 'bi-check-circle-fill', desc: 'Salary & docs' }
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/profile/my-profile');
                const p = res.data;
                setFormData({
                    name: p.name || '',
                    gender: p.gender || '',
                    dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : '',
                    phone: p.phone || '',
                    whatsapp: p.whatsapp || '',
                    email: p.email || '',
                    city: p.city || '',
                    state: p.state || '',
                    pincode: p.pincode || '',
                    bio: p.bio || '',
                    languages: p.languages?.join(', ') || '',
                    skills: p.skills?.join(', ') || '',
                    expectedSalaryMin: p.expectedSalary?.min || '',
                    expectedSalaryMax: p.expectedSalary?.max || '',
                    expectedSalaryType: p.expectedSalary?.type || 'monthly',
                    aadhaarNumber: p.documents?.aadhaar?.number || '',
                    panNumber: p.documents?.pan?.number || '',
                    licenseNumber: p.documents?.license?.number || ''
                });
                if (p.avatar) setAvatar(p.avatar);
            } catch (err) {
                if (err.response?.status !== 404) console.error("Failed to fetch profile", err);
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await axios.post('/api/profile/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAvatar(res.data.avatar);
        } catch (err) {
            alert('Failed to upload photo');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                gender: formData.gender,
                dob: formData.dob,
                phone: formData.phone,
                whatsapp: formData.whatsapp,
                email: formData.email,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                bio: formData.bio,
                languages: formData.languages.split(',').map(s => s.trim()).filter(s => s),
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                expectedSalary: {
                    min: Number(formData.expectedSalaryMin) || undefined,
                    max: formData.expectedSalaryMax ? Number(formData.expectedSalaryMax) : undefined,
                    type: formData.expectedSalaryType
                },
                documents: {
                    aadhaar: { number: formData.aadhaarNumber },
                    pan: { number: formData.panNumber },
                    license: { number: formData.licenseNumber }
                }
            };
            await axios.put('/api/profile/my-profile', payload);
            if (formData.name) updateUserData({ name: formData.name });
            navigate('/profile');
        } catch (err) {
            console.error("Save failed", err);
            alert(err.response?.data?.message || "Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    if (fetching) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border" style={{ color: 'var(--primary-500)' }} role="status"></div>
            </div>
        );
    }

    const inputStyle = {
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '16px 18px',
        fontSize: '0.95rem',
        color: 'var(--text-main)',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '680px' }}>

                {/* Header */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center mb-4"
                        style={{
                            width: '72px', height: '72px', borderRadius: '20px',
                            background: 'linear-gradient(135deg, var(--primary-500), #8b5cf6)',
                            boxShadow: '0 12px 40px rgba(99, 102, 241, 0.35)'
                        }}>
                        <i className="bi bi-person-plus-fill text-white fs-3"></i>
                    </div>
                    <h1 className="fw-bold mb-2" style={{ fontSize: '2rem', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                        {formData.name ? 'Edit your profile' : 'Create your profile'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        Complete your profile to connect with employers
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="d-flex justify-content-center gap-2 mb-5">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            onClick={() => setCurrentStep(step.number)}
                            className="d-flex flex-column align-items-center"
                            style={{
                                cursor: 'pointer',
                                padding: '16px 20px',
                                borderRadius: '16px',
                                background: currentStep === step.number ? 'var(--bg-card)' : 'transparent',
                                border: currentStep === step.number ? '1px solid var(--border-color)' : '1px solid transparent',
                                boxShadow: currentStep === step.number ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
                                transition: 'all 0.3s ease',
                                minWidth: '90px'
                            }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: currentStep >= step.number
                                    ? 'linear-gradient(135deg, var(--primary-500), #8b5cf6)'
                                    : 'var(--bg-surface)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '8px',
                                transition: 'all 0.3s ease'
                            }}>
                                <i className={`bi ${step.icon}`} style={{
                                    color: currentStep >= step.number ? 'white' : 'var(--text-muted)',
                                    fontSize: '1rem'
                                }}></i>
                            </div>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 600,
                                color: currentStep === step.number ? 'var(--text-main)' : 'var(--text-muted)'
                            }}>{step.title}</span>
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                    padding: '40px',
                    marginBottom: '24px'
                }}>

                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div>
                            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Let's start with basics</h4>

                            {/* Photo Upload */}
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

                            <div className="mb-4">
                                <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange}
                                    style={inputStyle} className="form-control" placeholder="Enter your full name" />
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}
                                        style={inputStyle} className="form-select">
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Date of Birth</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                                        style={inputStyle} className="form-control" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    <i className="bi bi-whatsapp text-success me-2"></i>WhatsApp Number
                                </label>
                                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} maxLength={10}
                                    style={inputStyle} className="form-control" placeholder="10-digit number" />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {currentStep === 2 && (
                        <div>
                            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Where are you located?</h4>

                            {/* Settings redirect card */}
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
                                    <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange}
                                        style={inputStyle} className="form-control" placeholder="e.g. Mumbai" />
                                </div>
                                <div className="col-6">
                                    <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleChange}
                                        style={inputStyle} className="form-control" placeholder="e.g. Maharashtra" />
                                </div>
                            </div>

                            <div className="col-6">
                                <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Pincode</label>
                                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6}
                                    style={inputStyle} className="form-control" placeholder="e.g. 400001" />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Professional */}
                    {currentStep === 3 && (
                        <div>
                            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Tell us about your skills</h4>

                            <div className="mb-4">
                                <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Bio</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3"
                                    style={{ ...inputStyle, resize: 'none' }} className="form-control"
                                    placeholder="Tell employers about yourself..." />
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    Skills <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span>
                                </label>
                                <input type="text" name="skills" value={formData.skills} onChange={handleChange}
                                    style={inputStyle} className="form-control" placeholder="e.g. Driving, Cooking, Electrician" />
                                {formData.skills && (
                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        {formData.skills.split(',').filter(s => s.trim()).map((s, i) => (
                                            <span key={i} style={{
                                                background: 'linear-gradient(135deg, var(--primary-500), #8b5cf6)',
                                                color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500
                                            }}>{s.trim()}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold mb-2" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    Languages <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span>
                                </label>
                                <input type="text" name="languages" value={formData.languages} onChange={handleChange}
                                    style={inputStyle} className="form-control" placeholder="e.g. Hindi, English" />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Salary & Docs */}
                    {currentStep === 4 && (
                        <div>
                            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Almost done!</h4>

                            <p className="fw-semibold mb-3" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Expected Salary</p>
                            <div className="row g-3 mb-5">
                                <div className="col-4">
                                    <input type="number" name="expectedSalaryMin" value={formData.expectedSalaryMin} onChange={handleChange}
                                        style={inputStyle} className="form-control" placeholder="Min ₹" />
                                </div>
                                <div className="col-4">
                                    <input type="number" name="expectedSalaryMax" value={formData.expectedSalaryMax} onChange={handleChange}
                                        style={inputStyle} className="form-control" placeholder="Max ₹ (optional)" />
                                </div>
                                <div className="col-4">
                                    <select name="expectedSalaryType" value={formData.expectedSalaryType} onChange={handleChange}
                                        style={inputStyle} className="form-select">
                                        <option value="monthly">/ Month</option>
                                        <option value="daily">/ Day</option>
                                    </select>
                                </div>
                            </div>

                            <p className="fw-semibold mb-3" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                Identity Documents <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                            </p>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber}
                                        onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                                        maxLength={12} style={inputStyle} className="form-control" placeholder="Aadhaar (12 digits)" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange}
                                        maxLength={10} style={{ ...inputStyle, textTransform: 'uppercase' }} className="form-control" placeholder="PAN Number" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange}
                                        style={{ ...inputStyle, textTransform: 'uppercase' }} className="form-control" placeholder="Driving License" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="d-flex justify-content-between align-items-center">
                    {currentStep > 1 ? (
                        <button type="button" onClick={prevStep}
                            style={{
                                background: 'var(--bg-card)', color: 'var(--text-main)',
                                border: '1px solid var(--border-color)', borderRadius: '14px',
                                padding: '14px 28px', fontWeight: 600, fontSize: '0.95rem',
                                cursor: 'pointer', transition: 'all 0.2s ease'
                            }}>
                            <i className="bi bi-arrow-left me-2"></i>Back
                        </button>
                    ) : (
                        <button type="button" onClick={() => navigate('/profile')}
                            style={{
                                background: 'transparent', color: 'var(--text-muted)',
                                border: 'none', padding: '14px 28px', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer'
                            }}>
                            Cancel
                        </button>
                    )}

                    {currentStep < totalSteps ? (
                        <button type="button" onClick={nextStep}
                            style={{
                                background: 'linear-gradient(135deg, var(--primary-500), #8b5cf6)',
                                color: 'white', border: 'none', borderRadius: '14px',
                                padding: '14px 32px', fontWeight: 600, fontSize: '0.95rem',
                                cursor: 'pointer', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                                transition: 'all 0.2s ease'
                            }}>
                            Continue<i className="bi bi-arrow-right ms-2"></i>
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={loading}
                            style={{
                                background: loading ? 'var(--text-muted)' : 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white', border: 'none', borderRadius: '14px',
                                padding: '14px 32px', fontWeight: 600, fontSize: '0.95rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                                transition: 'all 0.2s ease'
                            }}>
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                            ) : (
                                <><i className="bi bi-check-lg me-2"></i>Save Profile</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditProfilePage;
