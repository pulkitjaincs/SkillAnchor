import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function PostJobPage() {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
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
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev, [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const jobData = {
                ...formData,
                skills:
                    formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                benefits:
                    formData.benefits.split(',').map(b => b.trim()).filter(Boolean),
                salaryMin: Number(formData.salaryMin),
                salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
                experienceMin: Number(formData.experienceMin),
                vacancies: Number(formData.vacancies)
            };
            const response = await axios.post('/api/jobs', jobData, { headers: { Authorization: `Bearer ${token}` } });
            console.log(response.data);
            navigate('/');
        } catch (error) {
            setError(err.response?.data?.error || 'Failed to post job');
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container py-5">
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
                                    <div className="mb-4">
                                        <h6 className="text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                            <span className="d-inline-block me-2" style={{ width: '20px', height: '2px', background: 'var(--primary-500)' }}></span>
                                            Basic Information
                                        </h6>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                            <i className="bi bi-tag me-1" style={{ color: 'var(--primary-500)' }}></i>Job Title *
                                        </label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange}
                                            className="form-control py-3 premium-input" placeholder="e.g. Kitchen Helper" required />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                            <i className="bi bi-file-text me-1" style={{ color: 'var(--primary-500)' }}></i>Description *
                                        </label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                                            className="form-control py-3 premium-input" placeholder="Describe the job responsibilities..." required />
                                    </div>

                                    {/* Section: Location */}
                                    <div className="mb-4 mt-5">
                                        <h6 className="text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                            <span className="d-inline-block me-2" style={{ width: '20px', height: '2px', background: 'var(--primary-500)' }}></span>
                                            Location & Category
                                        </h6>
                                    </div>

                                    <div className="row mb-4">
                                        <div className="col-md-4 mb-3 mb-md-0">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-grid me-1" style={{ color: 'var(--primary-500)' }}></i>Category *
                                            </label>
                                            <input type="text" name="category" value={formData.category} onChange={handleChange}
                                                className="form-control py-3 premium-input" placeholder="e.g. Hospitality" required />
                                        </div>
                                        <div className="col-md-4 mb-3 mb-md-0">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-geo-alt me-1" style={{ color: 'var(--primary-500)' }}></i>City *
                                            </label>
                                            <input type="text" name="city" value={formData.city} onChange={handleChange}
                                                className="form-control py-3 premium-input" placeholder="e.g. Mumbai" required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-map me-1" style={{ color: 'var(--primary-500)' }}></i>State *
                                            </label>
                                            <input type="text" name="state" value={formData.state} onChange={handleChange}
                                                className="form-control py-3 premium-input" placeholder="e.g. Maharashtra" required />
                                        </div>
                                    </div>

                                    {/* Section: Compensation */}
                                    <div className="mb-4 mt-5">
                                        <h6 className="text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                            <span className="d-inline-block me-2" style={{ width: '20px', height: '2px', background: 'var(--primary-500)' }}></span>
                                            Compensation
                                        </h6>
                                    </div>

                                    <div className="row mb-4">
                                        <div className="col-md-4 mb-3 mb-md-0">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-currency-rupee me-1" style={{ color: 'var(--primary-500)' }}></i>Min Salary *
                                            </label>
                                            <input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange}
                                                className="form-control py-3 premium-input" placeholder="15000" required />
                                        </div>
                                        <div className="col-md-4 mb-3 mb-md-0">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-currency-rupee me-1" style={{ color: 'var(--text-muted)' }}></i>Max Salary
                                            </label>
                                            <input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange}
                                                className="form-control py-3 premium-input" placeholder="25000" />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-calendar3 me-1" style={{ color: 'var(--primary-500)' }}></i>Salary Type *
                                            </label>
                                            <select name="salaryType" value={formData.salaryType} onChange={handleChange}
                                                className="form-select py-3 premium-input">
                                                <option value="monthly">Monthly</option>
                                                <option value="daily">Daily</option>
                                                <option value="hourly">Hourly</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Section: Job Details */}
                                    <div className="mb-4 mt-5">
                                        <h6 className="text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                            <span className="d-inline-block me-2" style={{ width: '20px', height: '2px', background: 'var(--primary-500)' }}></span>
                                            Job Details
                                        </h6>
                                    </div>

                                    <div className="row mb-4">
                                        <div className="col-md-4 mb-3 mb-md-0">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-clock me-1" style={{ color: 'var(--primary-500)' }}></i>Job Type *
                                            </label>
                                            <select name="jobType" value={formData.jobType} onChange={handleChange}
                                                className="form-select py-3 premium-input">
                                                <option value="full-time">Full Time</option>
                                                <option value="part-time">Part Time</option>
                                                <option value="contract">Contract</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3 mb-md-0">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-sun me-1" style={{ color: 'var(--primary-500)' }}></i>Shift
                                            </label>
                                            <select name="shift" value={formData.shift} onChange={handleChange}
                                                className="form-select py-3 premium-input">
                                                <option value="day">Day</option>
                                                <option value="night">Night</option>
                                                <option value="flexible">Flexible</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-people me-1" style={{ color: 'var(--primary-500)' }}></i>Vacancies
                                            </label>
                                            <input type="number" name="vacancies" value={formData.vacancies} onChange={handleChange}
                                                className="form-control py-3 premium-input" min="1" />
                                        </div>
                                    </div>

                                    {/* Section: Requirements */}
                                    <div className="mb-4 mt-5">
                                        <h6 className="text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                            <span className="d-inline-block me-2" style={{ width: '20px', height: '2px', background: 'var(--primary-500)' }}></span>
                                            Skills & Benefits
                                        </h6>
                                    </div>

                                    <div className="row mb-5">
                                        <div className="col-md-6 mb-3 mb-md-0">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-tools me-1" style={{ color: 'var(--primary-500)' }}></i>Skills (comma separated)
                                            </label>
                                            <input type="text" name="skills" value={formData.skills} onChange={handleChange}
                                                className="form-control py-3 premium-input" placeholder="Cooking, Cleaning, Hindi" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                                                <i className="bi bi-gift me-1" style={{ color: 'var(--primary-500)' }}></i>Benefits (comma separated)
                                            </label>
                                            <input type="text" name="benefits" value={formData.benefits} onChange={handleChange}
                                                className="form-control py-3 premium-input" placeholder="Food, Accommodation, PF" />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn w-100 py-3 fw-bold rounded-pill post-job-btn" disabled={loading}
                                        style={{ background: 'var(--text-main)', color: 'var(--bg-body)', fontSize: '1rem' }}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Posting...</>
                                        ) : (
                                            <><i className="bi bi-send-fill me-2"></i>Post Job</>
                                        )}
                                    </button>
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