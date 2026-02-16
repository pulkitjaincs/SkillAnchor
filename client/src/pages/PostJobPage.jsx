import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from "../hooks/index.js";
import { InputField, SelectField, TextAreaField, Button } from "../components/common/FormComponents.jsx";
import { CATEGORY_OPTIONS } from '../constants/jobConstants';
import { useCreateJob } from '../hooks/queries/useApplications';

function PostJobPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const createMutation = useCreateJob();
    const { values: formData, handleChange } = useForm({
        title: '',
        description: '',
        category: '',
        city: '',
        state: '',
        salaryMin: '',
        salaryMax: '',
        salaryType: 'monthly',
        jobType: 'full-time',
        shift: 'day',
        experienceMin: 0,
        skills: '',
        gender: 'any',
        benefits: '',
        vacancies: 1
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const jobData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                benefits: formData.benefits.split(',').map(b => b.trim()).filter(Boolean),
                salaryMin: Number(formData.salaryMin),
                salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
                experienceMin: Number(formData.experienceMin),
                vacancies: Number(formData.vacancies)
            };
            await createMutation.mutateAsync(jobData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job');
        }
    };
    return (
        <>
            <div className="container py-5">
                <Link to="/my-jobs" className="text-decoration-none d-inline-flex align-items-center mb-3"
                    style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    ← Back to My Jobs
                </Link>
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 overflow-hidden"
                            style={{
                                background: 'var(--bg-card)',
                                borderRadius: '24px',
                                border: '1px solid var(--border-color)'
                            }}>
                            {/* Premium Header */}
                            <div style={{
                                background: 'var(--text-main)',
                                padding: '2rem',
                                color: 'var(--bg-body)'
                            }}>
                                <h2 className="fw-bold mb-1" style={{ color: 'var(--bg-body)' }}>
                                    <i className="bi bi-briefcase-fill me-2"></i>
                                    Post a New Job
                                </h2>
                                <p className="mb-0" style={{ opacity: 0.7 }}>Fill in the details to reach qualified workers</p>
                            </div>

                            <div className="card-body p-4 p-lg-5">
                                {error && (
                                    <div className="alert alert-danger rounded-3 d-flex align-items-center">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit}>
                                    {/* Section: Basic Info */}
                                    <div className="mb-4 mt-2">
                                        <h6 className="text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                            <span className="d-inline-block me-2" style={{ width: '20px', height: '2px', background: 'var(--primary-500)' }}></span>
                                            Basic Information
                                        </h6>
                                        <InputField label="Job Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Kitchen Helper" required />
                                        <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the job responsibilities..." required />
                                    </div>

                                    {/* Section: Location */}
                                    <div className="mb-4 mt-5">
                                        <h6 className="text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                            <span className="d-inline-block me-2" style={{ width: '20px', height: '2px', background: 'var(--primary-500)' }}></span>
                                            Location & Category
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <SelectField
                                                    label="Category"
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    options={CATEGORY_OPTIONS}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" required />
                                            </div>
                                            <div className="col-md-4">
                                                <InputField label="State" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Maharashtra" required />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Compensation */}
                                    <div className="mb-4 mt-5">
                                        <h6 className="text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                            <span className="d-inline-block me-2" style={{ width: '20px', height: '2px', background: 'var(--primary-500)' }}></span>
                                            Compensation
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <InputField label="Min Salary" name="salaryMin" type="number" value={formData.salaryMin} onChange={handleChange} placeholder="15000" required />
                                            </div>
                                            <div className="col-md-4">
                                                <InputField label="Max Salary" name="salaryMax" type="number" value={formData.salaryMax} onChange={handleChange} placeholder="25000" />
                                            </div>
                                            <div className="col-md-4">
                                                <SelectField
                                                    label="Salary Type" name="salaryType" value={formData.salaryType} onChange={handleChange}
                                                    options={[{ label: 'Monthly', value: 'monthly' }, { label: 'Daily', value: 'daily' }, { label: 'Hourly', value: 'hourly' }]}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Job Details */}
                                    <div className="mb-4 mt-5">
                                        <h6 className="text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                            <span className="d-inline-block me-2" style={{ width: '20px', height: '2px', background: 'var(--primary-500)' }}></span>
                                            Job Details
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <SelectField
                                                    label="Job Type" name="jobType" value={formData.jobType} onChange={handleChange}
                                                    options={[{ label: 'Full Time', value: 'full-time' }, { label: 'Part Time', value: 'part-time' }, { label: 'Contract', value: 'contract' }]}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <SelectField
                                                    label="Shift" name="shift" value={formData.shift} onChange={handleChange}
                                                    options={[{ label: 'Day', value: 'day' }, { label: 'Night', value: 'night' }, { label: 'Flexible', value: 'flexible' }]}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <InputField label="Vacancies" name="vacancies" type="number" value={formData.vacancies} onChange={handleChange} placeholder="1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Requirements */}
                                    <div className="mb-4 mt-5">
                                        <h6 className="text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                            <span className="d-inline-block me-2" style={{ width: '20px', height: '2px', background: 'var(--primary-500)' }}></span>
                                            Skills & Benefits
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <InputField label="Skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="Cooking, Hindi (comma separated)" />
                                            </div>
                                            <div className="col-md-6">
                                                <InputField label="Benefits" name="benefits" value={formData.benefits} onChange={handleChange} placeholder="Food, Accommodation (comma separated)" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <Button type="submit" variant="primary" loading={createMutation.isLoading} fullWidth>
                                            Post Job
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PostJobPage