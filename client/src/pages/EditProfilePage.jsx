import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks';
import { Button } from '../components/common/FormComponents';

import { useProfile, useUpdateProfile, useUploadAvatar } from '../hooks/queries/useProfile';

const EditProfile_Basics = lazy(() => import('../components/profile-edit/EditProfile_Basics'));
const EditProfile_Location = lazy(() => import('../components/profile-edit/EditProfile_Location'));
const EditProfile_Skills = lazy(() => import('../components/profile-edit/EditProfile_Skills'));
const EditProfile_Finish = lazy(() => import('../components/profile-edit/EditProfile_Finish'));

const steps = [
    { number: 1, title: 'Basics', icon: 'bi-person-badge' },
    { number: 2, title: 'Location', icon: 'bi-geo-alt' },
    { number: 3, title: 'Skills', icon: 'bi-gear' },
    { number: 4, title: 'Finish', icon: 'bi-check2-circle' }
];


function EditProfilePage() {
    const navigate = useNavigate();
    const { updateUserData, user: authUser } = useAuth();
    const isEmployer = authUser?.role === 'employer';
    const [searchParams] = useSearchParams();
    const initialStep = parseInt(searchParams.get('step')) || 1;
    const [currentStep, setCurrentStep] = useState(initialStep);
    const totalSteps = isEmployer ? 1 : 4;
    const [avatar, setAvatar] = useState(null);
    const fileInputRef = useRef(null);

    const { data: profile, isLoading: fetching } = useProfile();
    const updateMutation = useUpdateProfile();
    const uploadAvatarMutation = useUploadAvatar();

    const {
        values: formData,
        handleChange,
        setValues
    } = useForm({
        name: '', gender: '', dob: '', phone: '', whatsapp: '', email: '',
        city: '', state: '', pincode: '', bio: '', languages: '', skills: '',
        expectedSalaryMin: '', expectedSalaryMax: '', expectedSalaryType: 'monthly',
        aadhaarNumber: '', panNumber: '', licenseNumber: '', designation: '', isHiringManager: false
    });

    useEffect(() => {
        if (profile) {
            setValues({
                name: profile.name || '',
                gender: profile.gender || '',
                dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
                phone: profile.phone || '',
                whatsapp: profile.whatsapp || '',
                email: profile.email || '',
                city: profile.city || '',
                state: profile.state || '',
                pincode: profile.pincode || '',
                bio: profile.bio || '',
                languages: profile.languages?.join(', ') || '',
                skills: profile.skills?.join(', ') || '',
                expectedSalaryMin: profile.expectedSalary?.min || '',
                expectedSalaryMax: profile.expectedSalary?.max || '',
                expectedSalaryType: profile.expectedSalary?.type || 'monthly',
                aadhaarNumber: profile.documents?.aadhaar?.number || '',
                panNumber: profile.documents?.pan?.number || '',
                licenseNumber: profile.documents?.license?.number || '',
                designation: profile.designation || '',
                isHiringManager: profile.isHiringManager || false
            });
            if (profile.avatar) setAvatar(profile.avatar);
        }
    }, [profile, setValues]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const { data } = await uploadAvatarMutation.mutateAsync(formData);
            setAvatar(data.avatar);
        } catch (err) {
            alert('Failed to upload photo');
        }
    };

    const handleSubmit = async () => {
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
            await updateMutation.mutateAsync(payload);
            if (formData.name) updateUserData({ name: formData.name });
            navigate('/profile');
        } catch (err) {
            console.error("Save failed", err);
            alert(err.response?.data?.message || "Failed to save profile.");
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

                    <Suspense fallback={<div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></div>}>
                        {currentStep === 1 && (
                            <EditProfile_Basics
                                formData={formData}
                                handleChange={handleChange}
                                user={authUser}
                                isEmployer={isEmployer}
                                avatar={avatar}
                                uploadingAvatar={uploadAvatarMutation.isLoading}
                                handleAvatarUpload={handleAvatarUpload}
                                fileInputRef={fileInputRef}
                                navigate={navigate}
                            />
                        )}

                        {currentStep === 2 && (
                            <EditProfile_Location
                                formData={formData}
                                handleChange={handleChange}
                                navigate={navigate}
                            />
                        )}

                        {currentStep === 3 && (
                            <EditProfile_Skills
                                formData={formData}
                                handleChange={handleChange}
                            />
                        )}

                        {currentStep === 4 && (
                            <EditProfile_Finish
                                formData={formData}
                                handleChange={handleChange}
                                setValues={setValues}
                            />
                        )}
                    </Suspense>
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
                            loading={updateMutation.isLoading}
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
