import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks';
import { profileAPI, workExperienceAPI } from '../services/api';
import { formatDate } from '../utils';
import { InputField, SelectField, TextAreaField, Button } from '../components/common/FormComponents';

function EditProfilePage() {
    const navigate = useNavigate();
    const { updateUserData, user } = useAuth();
    const isEmployer = user?.role === 'employer';
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchParams] = useSearchParams();
    const initialStep = parseInt(searchParams.get('step')) || 1;
    const [currentStep, setCurrentStep] = useState(initialStep);
    const totalSteps = isEmployer ? 1 : 5;
    const [avatar, setAvatar] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const [newExp, setNewExp] = useState({
        role: '',
        companyName: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
    });
    const [expStatus, setExpStatus] = useState({ type: '', message: '' });

    const handleNewExpChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewExp(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };


    const {
        values: formData,
        handleChange,
        setValues,
        loading: saving,
        setLoading: setSaving
    } = useForm({
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
        licenseNumber: '',
        designation: '',
        isHiringManager: false
    });

    const steps = isEmployer ? [
        { number: 1, title: 'Profile', icon: 'bi-person-fill', desc: 'Your details' }
    ] : [
        { number: 1, title: 'Basics', icon: 'bi-person-fill', desc: 'Name & identity' },
        { number: 2, title: 'Location', icon: 'bi-geo-alt-fill', desc: 'Where you are' },
        { number: 3, title: 'Skills', icon: 'bi-stars', desc: 'What you do' },
        { number: 4, title: 'Experience', icon: 'bi-briefcase-fill', desc: 'Work history' },
        { number: 5, title: 'Finish', icon: 'bi-check-circle-fill', desc: 'Salary & docs' }
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: p } = await profileAPI.getMyProfile();
                setValues({
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
                if (p.designation) setValues(prev => ({ ...prev, designation: p.designation }));
                if (p.isHiringManager) setValues(prev => ({ ...prev, isHiringManager: p.isHiringManager }));
            } catch (err) {
                if (err.response?.status !== 404) console.error("Failed to fetch profile", err);
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);
    const handleDeleteWorkExperience = async (id) => {
        if (window.confirm('Delete this entry?')) {
            await workExperienceAPI.delete(id);
            window.location.reload();
        }
    };
    const handleAddWorkExperience = async () => {
        const { role, companyName, startDate, endDate, isCurrent, description } = newExp;
        setExpStatus({ type: '', message: '' });

        if (role && startDate) {
            try {
                await workExperienceAPI.create({
                    role,
                    companyName: companyName || undefined,
                    startDate,
                    endDate: isCurrent ? null : endDate,
                    isCurrent,
                    description
                });
                setExpStatus({ type: 'success', message: 'Experience added successfully!' });
                setNewExp({ role: '', companyName: '', startDate: '', endDate: '', isCurrent: false, description: '' });
                // Refresh and stay on the current step
                setTimeout(() => window.location.href = `/profile/edit?step=${currentStep}`, 1500);
            } catch (err) {
                setExpStatus({ type: 'error', message: 'Failed to add experience. Please try again.' });
            }
        } else {
            setExpStatus({ type: 'error', message: 'Please fill Role and Start Date' });
        }
    }


    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const { data } = await profileAPI.uploadAvatar(formData);
            setAvatar(data.avatar);
        } catch (err) {
            alert('Failed to upload photo');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            let payload;
            if (isEmployer) {
                payload = {
                    name: formData.name,
                    whatsapp: formData.whatsapp,
                    designation: formData.designation,
                    isHiringManager: formData.isHiringManager
                };
            } else {
                payload = {
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
            }
            await profileAPI.updateMyProfile(payload);
            if (formData.name) updateUserData({ name: formData.name });
            navigate('/profile');
        } catch (err) {
            console.error("Save failed", err);
            alert(err.response?.data?.message || "Failed to save profile.");
        } finally {
            setSaving(false);
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



    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '680px' }}>

                {/* Back Button */}
                <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="btn btn-link text-muted mb-4 d-inline-flex align-items-center p-0"
                    style={{ fontSize: '0.9rem', textDecoration: 'none' }}
                >
                    <i className="bi bi-arrow-left me-2"></i>Back to Profile
                </button>

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

                {totalSteps > 1 && (
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
                )}

                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                    padding: '40px',
                    marginBottom: '24px'
                }}>

                    {currentStep === 1 && (
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
                                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', cursor: 'not-allowed' }}
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
                                                onChange={(e) => setValues({ ...formData, isHiringManager: e.target.checked })}
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
                    )}

                    {currentStep === 2 && (
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
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Tell us about your skills</h4>

                            <TextAreaField label="Bio" name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell employers about yourself..." />

                            <InputField
                                label="Skills"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="e.g. Driving, Cooking, Electrician"
                                helpText="Comma separated"
                            />
                            {formData.skills && (
                                <div className="d-flex flex-wrap gap-2 mt-2 mb-4">
                                    {formData.skills.split(',').filter(s => s.trim()).map((s, i) => (
                                        <span key={i} style={{
                                            background: 'linear-gradient(135deg, var(--primary-500), #8b5cf6)',
                                            color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500
                                        }}>{s.trim()}</span>
                                    ))}
                                </div>
                            )}

                            <InputField
                                label="Languages"
                                name="languages"
                                value={formData.languages}
                                onChange={handleChange}
                                placeholder="e.g. Hindi, English"
                                helpText="Comma separated"
                            />

                        </div>
                    )}

                    {currentStep === 4 && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Work History</h4>
                            </div>

                            <p className="text-muted small mb-4">
                                Add your past work experience to improve your profile score.
                                <br /><span className="text-primary">Note: Verified experiences from jobs you were hired for on KaamSetu cannot be edited here.</span>
                            </p>

                            <div className="d-flex flex-column gap-3 mb-4">
                                {user?.workHistory?.map((exp) => (
                                    <div key={exp._id} className="p-3 rounded-3" style={{
                                        background: 'var(--bg-surface)',
                                        border: exp.isVerified ? '1px solid #10b981' : '1px solid var(--border-color)'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <h6 className="fw-bold mb-0">{exp.role}</h6>
                                                    {exp.isVerified && (
                                                        <span className="badge" style={{
                                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                                            fontSize: '0.65rem',
                                                            padding: '3px 8px'
                                                        }}>
                                                            <i className="bi bi-patch-check-fill me-1"></i>Verified
                                                        </span>
                                                    )}
                                                </div>
                                                {(exp.companyName || exp.company?.name) && (
                                                    <p className="small text-muted mb-1">{exp.companyName || exp.company?.name}</p>
                                                )}
                                                <p className="small text-muted mb-0">
                                                    {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                                </p>
                                            </div>
                                            {!exp.isVerified && (
                                                <div className="d-flex gap-1">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm border-0"
                                                        style={{ color: 'var(--text-muted)' }}
                                                        onClick={() => {
                                                            setNewExp({
                                                                role: exp.role || '',
                                                                companyName: exp.companyName || '',
                                                                startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
                                                                endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
                                                                isCurrent: !exp.endDate,
                                                                description: exp.description || ''
                                                            });
                                                            handleDeleteWorkExperience(exp._id);
                                                            setExpStatus({ type: 'success', message: 'Editing experience - update the form below and save.' });
                                                        }}
                                                        title="Edit"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm text-danger border-0"
                                                        onClick={() => handleDeleteWorkExperience(exp._id)}
                                                        title="Delete"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 rounded-4" style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
                            }}>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="d-flex align-items-center justify-content-center" style={{
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, var(--primary-500), #8b5cf6)'
                                    }}>
                                        <i className="bi bi-plus-lg text-white fs-5"></i>
                                    </div>
                                    <h6 className="fw-bold mb-0" style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>Add New Experience</h6>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <InputField
                                            label="Job Title / Role"
                                            name="role"
                                            value={newExp.role}
                                            onChange={handleNewExpChange}
                                            placeholder="e.g. Electrician"
                                            sm
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <InputField
                                            label="Company Name"
                                            name="companyName"
                                            value={newExp.companyName}
                                            onChange={handleNewExpChange}
                                            placeholder="e.g. ABC Pvt Ltd"
                                            sm
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <InputField
                                            label="Start Date"
                                            name="startDate"
                                            type="date"
                                            value={newExp.startDate}
                                            onChange={handleNewExpChange}
                                            sm
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <InputField
                                            label="End Date"
                                            name="endDate"
                                            type="date"
                                            value={newExp.endDate}
                                            onChange={handleNewExpChange}
                                            disabled={newExp.isCurrent}
                                            sm
                                        />
                                        <div className="form-check mt-1">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                name="isCurrent"
                                                id="expCurrent"
                                                checked={newExp.isCurrent}
                                                onChange={handleNewExpChange}
                                            />
                                            <label className="form-check-label small text-muted" htmlFor="expCurrent">Currently working here</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <TextAreaField
                                            label="Description (Optional)"
                                            name="description"
                                            value={newExp.description}
                                            onChange={handleNewExpChange}
                                            rows="2"
                                            placeholder="Describe your role..."
                                            sm
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAddWorkExperience}
                                    style={{
                                        marginTop: '20px',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                                        width: '100%'
                                    }}
                                >
                                    <i className="bi bi-plus-lg me-2"></i>Add Experience
                                </Button>

                                {expStatus.message && (
                                    <div className={`alert ${expStatus.type === 'success' ? 'alert-success' : 'alert-danger'} mt-3 mb-0 d-flex align-items-center`}
                                        style={{ borderRadius: '12px', fontSize: '0.9rem' }}>
                                        <i className={`bi ${expStatus.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-2`}></i>
                                        {expStatus.message}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                    {currentStep === 5 && (
                        <div>
                            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Almost done!</h4>

                            <p className="fw-semibold mb-1" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Expected Salary</p>
                            <div className="row g-2 mb-4">
                                <div className="col-4">
                                    <InputField name="expectedSalaryMin" value={formData.expectedSalaryMin} onChange={handleChange} type="number" placeholder="Min ₹" />
                                </div>
                                <div className="col-4">
                                    <InputField name="expectedSalaryMax" value={formData.expectedSalaryMax} onChange={handleChange} type="number" placeholder="Max ₹ (optional)" />
                                </div>
                                <div className="col-4">
                                    <SelectField
                                        name="expectedSalaryType"
                                        value={formData.expectedSalaryType}
                                        onChange={handleChange}
                                        options={[
                                            { label: '/ Month', value: 'monthly' },
                                            { label: '/ Day', value: 'daily' }
                                        ]}
                                    />
                                </div>
                            </div>

                            <p className="fw-semibold mb-1" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                Identity Documents <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                            </p>
                            <div className="row g-2">
                                <div className="col-md-6">
                                    <InputField
                                        name="aadhaarNumber"
                                        value={formData.aadhaarNumber}
                                        onChange={(e) => setValues({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                                        maxLength={12}
                                        placeholder="Aadhaar (12 digits)"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <InputField
                                        name="panNumber"
                                        value={formData.panNumber}
                                        onChange={handleChange}
                                        maxLength={10}
                                        style={{ textTransform: 'uppercase' }}
                                        placeholder="PAN Number"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <InputField
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                        style={{ textTransform: 'uppercase' }}
                                        placeholder="Driving License"
                                    />
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                <div className="d-flex justify-content-between align-items-center">
                    {currentStep > 1 ? (
                        <Button variant="secondary" onClick={prevStep} style={{ width: 'auto', padding: '14px 28px' }}>
                            <i className="bi bi-arrow-left me-2"></i>Back
                        </Button>
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
                        <Button
                            onClick={nextStep}
                            style={{
                                width: 'auto',
                                padding: '14px 32px',
                                background: 'linear-gradient(135deg, var(--primary-500), #8b5cf6)',
                                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)'
                            }}
                        >
                            Continue<i className="bi bi-arrow-right ms-2"></i>
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            loading={saving}
                            style={{
                                width: 'auto',
                                padding: '14px 32px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
                            }}
                        >
                            <i className="bi bi-check-lg me-2"></i>Save Profile
                        </Button>
                    )}
                </div>

            </div>
        </div>
    );
}

export default EditProfilePage;
