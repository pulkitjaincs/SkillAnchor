"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useForm } from '@/hooks';
import { Button } from '@/components/common/FormComponents';

import { useProfile, useUpdateProfile, useUpdateAvatarUrl } from '@/hooks/queries/useProfile';
import { uploadFileToS3 } from '@/utils/s3';

import EditProfile_Basics from '@/components/profile-edit/EditProfile_Basics';
import EditProfile_Location from '@/components/profile-edit/EditProfile_Location';
import EditProfile_Skills from '@/components/profile-edit/EditProfile_Skills';
import EditProfile_Finish from '@/components/profile-edit/EditProfile_Finish';

const steps = [
    { number: 1, title: 'Basics', icon: 'bi-person-badge' },
    { number: 2, title: 'Location', icon: 'bi-geo-alt' },
    { number: 3, title: 'Skills', icon: 'bi-gear' },
    { number: 4, title: 'Finish', icon: 'bi-check2-circle' }
];

export default function EditProfileClient() {
    const router = useRouter();
    const navigate = router.push;
    const { updateUserData, user: authUser } = useAuth();
    const isEmployer = authUser?.role === 'employer';
    const searchParams = useSearchParams();
    const initialStep = parseInt(searchParams.get('step') || '1') || 1;
    const [currentStep, setCurrentStep] = useState(initialStep);
    const totalSteps = isEmployer ? 1 : 4;
    const [avatar, setAvatar] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: profile, isLoading: fetching } = useProfile();
    const updateMutation = useUpdateProfile();
    const updateAvatarUrlMutation = useUpdateAvatarUrl();

    const {
        values: formData,
        handleChange,
        setValues
    } = useForm({
        name: '', gender: '', dob: '', phone: '', whatsapp: '', email: '',
        city: '', state: '', pincode: '', bio: '', languages: '', skills: '',
        expectedSalaryMin: '', expectedSalaryMax: '', expectedSalaryType: 'monthly',
        aadhaarNumber: '', panNumber: '', licenseNumber: '', designation: '', isHiringManager: false,
        isAvatarHidden: false
    });

    useEffect(() => {
        if (profile) {
            setValues({
                ...formData,
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
                expectedSalaryMin: String(profile.expectedSalary?.min || ''),
                expectedSalaryMax: String(profile.expectedSalary?.max || ''),
                expectedSalaryType: profile.expectedSalary?.type || 'monthly',
                aadhaarNumber: profile.documents?.aadhaar?.number || '',
                panNumber: profile.documents?.pan?.number || '',
                licenseNumber: profile.documents?.license?.number || '',
                designation: profile.designation || '',
                isHiringManager: profile.isHiringManager || false,
                isAvatarHidden: profile.isAvatarHidden || false
            });
            if (profile.avatarUrl || profile.avatar) setAvatar(profile.avatarUrl || profile.avatar || null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const { key } = await uploadFileToS3(file, 'avatars');
            const { data } = await updateAvatarUrlMutation.mutateAsync(key);
            const avatarUrl = (data.data as unknown as { avatarUrl?: string })?.avatarUrl;
            setAvatar(avatarUrl || null);
            updateUserData({ avatar: avatarUrl });
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload photo');
        }
    };

    const handleAvatarRemove = async () => {
        if (!confirm("Are you sure you want to remove your profile photo?")) return;
        try {
            await updateAvatarUrlMutation.mutateAsync('');
            setAvatar('');
            updateUserData({ avatar: undefined });
        } catch (err) {
            console.error('Remove error:', err);
            alert('Failed to remove photo');
        }
    };

    const handleSubmit = async (shouldNavigate = true) => {
        try {
            let payload: Record<string, unknown>;
            if (isEmployer) {
                payload = {
                    name: formData.name,
                    whatsapp: formData.whatsapp,
                    designation: formData.designation,
                    isHiringManager: formData.isHiringManager,
                    isAvatarHidden: formData.isAvatarHidden
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
                    languages: typeof formData.languages === 'string' ? formData.languages.split(',').map((s: string) => s.trim()).filter((s: string) => s) : formData.languages,
                    skills: typeof formData.skills === 'string' ? formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : formData.skills,
                    expectedSalary: {
                        min: Number(formData.expectedSalaryMin) || undefined,
                        max: formData.expectedSalaryMax ? Number(formData.expectedSalaryMax) : undefined,
                        type: formData.expectedSalaryType
                    },
                    documents: {
                        aadhaar: { number: formData.aadhaarNumber },
                        pan: { number: formData.panNumber },
                        license: { number: formData.licenseNumber }
                    },
                    isAvatarHidden: formData.isAvatarHidden
                };
            }
            await updateMutation.mutateAsync(payload);
            if (formData.name) updateUserData({ name: formData.name });

            if (shouldNavigate) {
                navigate('/profile');
            } else {
                alert("Progress saved successfully!");
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            console.error("Save failed", err);
            alert(axiosErr.response?.data?.message || "Failed to save profile.");
        }
    };

    const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    const basicsHandleChange = handleChange as Parameters<typeof import('@/components/profile-edit/EditProfile_Basics').default>[0]['handleChange'];

    const basicsUser = (authUser ?? {}) as Parameters<typeof import('@/components/profile-edit/EditProfile_Basics').default>[0]['user'];

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
                                    transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                                    minWidth: '90px'
                                }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: currentStep >= step.number
                                        ? 'linear-gradient(135deg, var(--primary-500), #8b5cf6)'
                                        : 'var(--bg-surface)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '8px',
                                    transition: 'background-color 0.25s ease'
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
                        <EditProfile_Basics
                            formData={formData}
                            handleChange={basicsHandleChange}
                            user={basicsUser}
                            isEmployer={isEmployer}
                            avatar={avatar}
                            uploadingAvatar={updateAvatarUrlMutation.isPending}
                            handleAvatarUpload={handleAvatarUpload}
                            handleAvatarRemove={handleAvatarRemove}
                            fileInputRef={fileInputRef}
                            navigate={navigate}
                        />
                    )}

                    {currentStep === 2 && (
                        <EditProfile_Location
                            formData={formData}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            handleChange={handleChange as any}
                            navigate={navigate}
                        />
                    )}

                    {currentStep === 3 && (
                        <EditProfile_Skills
                            formData={formData}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            handleChange={handleChange as any}
                        />
                    )}

                    {currentStep === 4 && (
                        <EditProfile_Finish
                            formData={formData}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            handleChange={handleChange as any}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            setValues={setValues as any}
                        />
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
                        <div className="d-flex gap-3">
                            <Button
                                onClick={() => handleSubmit(false)}
                                loading={updateMutation.isPending}
                                variant="outline"
                                style={{
                                    width: 'auto',
                                    padding: '14px 28px',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-main)'
                                }}
                            >
                                <i className="bi bi-cloud-check me-2"></i>Save Progress
                            </Button>
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
                        </div>
                    ) : (
                        <Button
                            onClick={() => handleSubmit(true)}
                            loading={updateMutation.isPending}
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
