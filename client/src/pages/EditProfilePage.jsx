import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EditProfilePage() {
    const navigate = useNavigate();
    const { updateUserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

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
            } catch (err) {
                if (err.response?.status !== 404) {
                    console.error("Failed to fetch profile", err);
                }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                    min: Number(formData.expectedSalaryMin),
                    max: Number(formData.expectedSalaryMax),
                    type: formData.expectedSalaryType
                },
                documents: {
                    aadhaar: { number: formData.aadhaarNumber },
                    pan: { number: formData.panNumber },
                    license: { number: formData.licenseNumber }
                }
            };

            await axios.put('/api/profile/my-profile', payload);

            if (formData.name) {
                updateUserData({ name: formData.name });
            }

            alert("Profile saved successfully!");
            navigate('/profile');

        } catch (err) {
            console.error("Save failed", err);
            alert(err.response?.data?.message || "Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-lg" style={{ borderRadius: '24px', background: 'var(--bg-card)', overflow: 'hidden' }}>

                        <div className="card-header border-0 p-5 d-flex flex-column align-items-center justify-content-center"
                            style={{ background: 'linear-gradient(135deg, var(--primary-100), var(--bg-surface))' }}>
                            <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm"
                                style={{ width: '64px', height: '64px', background: 'var(--text-main)', color: 'var(--bg-body)' }}>
                                <i className="bi bi-pencil-fill fs-4"></i>
                            </div>
                            <h2 className="fw-bold mb-1 text-center" style={{ color: 'var(--text-main)' }}>
                                {formData.name ? 'Edit Profile' : 'Create Profile'}
                            </h2>
                            <p className="mb-0 text-muted opacity-75 text-center">Complete your profile to stand out to employers</p>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={handleSubmit}>

                                {/* 1. Basic Details */}
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: 'var(--text-main)' }}>
                                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                                        <i className="bi bi-person-lines-fill fs-6"></i>
                                    </div>
                                    Basic Details
                                </h5>

                                <div className="row g-4 mb-5">
                                    <div className="col-12">
                                        <div className="d-flex align-items-center gap-4 p-3 rounded-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                                            <div className="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm"
                                                style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                                                <i className="bi bi-camera fs-3 text-secondary"></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1">Profile Photo</h6>
                                                <div className="form-text small mb-2">Supported: JPG, PNG (Max 2MB)</div>
                                                <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium">
                                                    <i className="bi bi-upload me-2"></i>Upload New
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Full Name *</label>
                                        <input type="text" className="form-control premium-input py-3" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Gender *</label>
                                        <select className="form-select premium-input py-3" name="gender" value={formData.gender} onChange={handleChange} required>
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Date of Birth</label>
                                        <input type="date" className="form-control premium-input py-3" name="dob" value={formData.dob} onChange={handleChange} />
                                    </div>
                                </div>

                                {/* 2. Contact Info - MOVED TO SETTINGS PAGE */}
                                <div className="d-flex align-items-center justify-content-between p-4 rounded-4 mb-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-600)' }}>
                                            <i className="bi bi-shield-lock-fill fs-5"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">Contact & Security</h6>
                                            <p className="mb-0 small text-muted">Manage your Email, Phone, and Password in Account Settings.</p>
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-outline-primary rounded-pill px-3 fw-medium" onClick={() => navigate('/settings')}>
                                        Manage
                                    </button>
                                </div>

                                <div className="row g-4 mb-5">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-uppercase text-muted">WhatsApp <span className="fw-normal opacity-75">(Optional)</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 text-success bg-success-subtle" style={{ borderRadius: '12px 0 0 12px' }}><i className="bi bi-whatsapp"></i></span>
                                            <input type="tel" className="form-control premium-input py-3 shadow-none" name="whatsapp" value={formData.whatsapp} onChange={handleChange} maxLength={10} style={{ borderRadius: '0 12px 12px 0', borderLeft: 'none' }} placeholder="WhatsApp Number" />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Location */}
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 mt-5" style={{ color: 'var(--text-main)' }}>
                                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                                        <i className="bi bi-geo-alt fs-6"></i>
                                    </div>
                                    Current Location
                                </h5>
                                <div className="row g-4 mb-5">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted">City *</label>
                                        <input type="text" className="form-control premium-input py-3" name="city" value={formData.city} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted">State *</label>
                                        <input type="text" className="form-control premium-input py-3" name="state" value={formData.state} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Pincode</label>
                                        <input type="text" className="form-control premium-input py-3" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} />
                                    </div>
                                </div>

                                {/* 4. Professional Details */}
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 mt-5" style={{ color: 'var(--text-main)' }}>
                                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                                        <i className="bi bi-briefcase fs-6"></i>
                                    </div>
                                    Professional Details
                                </h5>
                                <div className="row g-4 mb-5">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Short Bio</label>
                                        <textarea className="form-control premium-input py-3" rows="4" name="bio" placeholder="Tell employers about your experience, strengths, and what kind of work you are looking for..." value={formData.bio} onChange={handleChange}></textarea>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Skills * <span className="fw-normal opacity-75">(separated by commas)</span></label>
                                        <input type="text" className="form-control premium-input py-3" name="skills" placeholder="e.g. Carpentry, Driver, Cooking, Electrician" value={formData.skills} onChange={handleChange} required />
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            {/* Preview Skills */}
                                            {formData.skills.split(',').filter(s => s.trim()).map((s, i) => (
                                                <span key={i} className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-medium">{s.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Languages Known <span className="fw-normal opacity-75">(separated by commas)</span></label>
                                        <input type="text" className="form-control premium-input py-3" name="languages" placeholder="e.g. Hindi, English, Marathi" value={formData.languages} onChange={handleChange} />
                                    </div>
                                </div>

                                {/* 5. Salary */}
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 mt-5" style={{ color: 'var(--text-main)' }}>
                                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                                        <i className="bi bi-cash-stack fs-6"></i>
                                    </div>
                                    Expected Salary
                                </h5>
                                <div className="row g-4 mb-5">
                                    <div className="col-4">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Min (₹)</label>
                                        <input type="number" className="form-control premium-input py-3" name="expectedSalaryMin" value={formData.expectedSalaryMin} onChange={handleChange} placeholder="0" />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Max (₹)</label>
                                        <input type="number" className="form-control premium-input py-3" name="expectedSalaryMax" value={formData.expectedSalaryMax} onChange={handleChange} placeholder="0" />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Frequency</label>
                                        <select className="form-select premium-input py-3" name="expectedSalaryType" value={formData.expectedSalaryType} onChange={handleChange}>
                                            <option value="monthly">/ Month</option>
                                            <option value="daily">/ Day</option>
                                            <option value="weekly">/ Week</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 6. Documents */}
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 mt-5" style={{ color: 'var(--text-main)' }}>
                                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                                        <i className="bi bi-card-heading fs-6"></i>
                                    </div>
                                    Identity Documents
                                </h5>
                                <div className="row g-4 mb-5">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Aadhaar Number</label>
                                        <input type="text" className="form-control premium-input py-3" name="aadhaarNumber" placeholder="12-digit Aadhaar Number" value={formData.aadhaarNumber}
                                            onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })} maxLength={12} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted">PAN Number</label>
                                        <input type="text" className="form-control premium-input py-3 text-uppercase" name="panNumber" placeholder="ABCDE1234F" value={formData.panNumber} onChange={handleChange} maxLength={10} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Driving License</label>
                                        <input type="text" className="form-control premium-input py-3 text-uppercase" name="licenseNumber" placeholder="DL-123..." value={formData.licenseNumber} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="d-grid mt-5 pt-3">
                                    <button type="submit" className="btn btn-primary-gradient py-3 fw-bold rounded-pill shadow-lg" disabled={loading}
                                        style={{ fontSize: '1.1rem' }}>
                                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : 'Save Profile Changes'}
                                    </button>
                                    <button type="button" className="btn btn-link text-muted mt-3 text-decoration-none" onClick={() => navigate('/profile')}>
                                        Cancel
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfilePage;
