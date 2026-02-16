import { useState, useEffect } from 'react';
import { workExperienceAPI } from '../services/api';
import { formatDate } from '../utils';
import { InputField, TextAreaField, Button } from './common/FormComponents';

/**
 * Work Experience Modal - handles viewing, adding, editing work experiences
 * @param {Object} props
 * @param {boolean} props.show - Whether modal is visible
 * @param {Function} props.onClose - Close handler
 * @param {Object|null} props.experience - Existing experience to view/edit, or null for add mode
 * @param {Function} props.onSave - Callback after successful save/delete
 */
function WorkExperienceModal({ show, onClose, experience, onSave }) {
    const isAddMode = !experience;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        role: '',
        companyName: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
    });

    useEffect(() => {
        if (experience) {
            setFormData({
                role: experience.role || '',
                companyName: experience.companyName || experience.company?.name || '',
                startDate: experience.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
                endDate: experience.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
                isCurrent: experience.isCurrent || !experience.endDate,
                description: experience.description || ''
            });
        } else {
            setFormData({ role: '', companyName: '', startDate: '', endDate: '', isCurrent: false, description: '' });
        }
        setError('');
    }, [experience, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async () => {
        if (!formData.role || !formData.startDate) {
            setError('Role and Start Date are required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (isAddMode) {
                await workExperienceAPI.create({
                    ...formData,
                    endDate: formData.isCurrent ? null : formData.endDate
                });
            } else {
                await workExperienceAPI.update(experience._id, {
                    ...formData,
                    endDate: formData.isCurrent ? null : formData.endDate
                });
            }
            onSave?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save experience');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this experience?')) return;
        setLoading(true);
        try {
            await workExperienceAPI.delete(experience._id);
            onSave?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVisibility = async () => {
        setLoading(true);
        try {
            await workExperienceAPI.toggleVisibility(experience._id);
            onSave?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update visibility');
        } finally {
            setLoading(false);
        }
    };

    const handleEndEmployment = async () => {
        if (!window.confirm('Are you sure you want to end this employment? This will update your job application status.')) return;
        setLoading(true);
        try {
            await workExperienceAPI.endEmployment(experience._id);
            onSave?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to end employment');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const isVerified = experience?.isVerified;
    const canEdit = !isVerified;
    const canEndEmployment = isVerified && experience?.isCurrent;

    return (
        <div className="modal show d-block" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <div className="modal-content" style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px'
                }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ color: 'var(--text-main)' }}>
                            {isAddMode ? 'Add Work Experience' : (canEdit ? 'Edit Experience' : 'Experience Details')}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose} style={{ filter: 'var(--icon-filter)' }}></button>
                    </div>
                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger py-2 mb-3" style={{ borderRadius: '10px', fontSize: '0.9rem' }}>
                                {error}
                            </div>
                        )}

                        {/* Visibility Toggle - always shown for existing experiences */}
                        {!isAddMode && (
                            <div className="d-flex align-items-center justify-content-between p-3 mb-3 rounded-3"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                                <div>
                                    <p className="mb-0 fw-semibold" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                        <i className={`bi ${experience.isVisible !== false ? 'bi-eye-fill' : 'bi-eye-slash'} me-2`}></i>
                                        {experience.isVisible !== false ? 'Visible on Profile' : 'Hidden from Profile'}
                                    </p>
                                    <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>
                                        Others {experience.isVisible !== false ? 'can' : 'cannot'} see this on your profile
                                    </p>
                                </div>
                                <button
                                    className="btn btn-sm"
                                    style={{
                                        background: experience.isVisible !== false ? 'var(--bg-surface)' : 'var(--primary-500)',
                                        color: experience.isVisible !== false ? 'var(--text-muted)' : '#fff',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px'
                                    }}
                                    onClick={handleToggleVisibility}
                                    disabled={loading}
                                >
                                    {experience.isVisible !== false ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        )}

                        {/* Verified Badge & End Employment */}
                        {isVerified && (
                            <div className="d-flex align-items-center justify-content-between p-3 mb-3 rounded-3"
                                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <i className="bi bi-patch-check-fill" style={{ color: '#10b981' }}></i>
                                    <span className="fw-semibold" style={{ color: '#10b981' }}>Verified Experience</span>
                                </div>
                                {canEndEmployment && (
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        style={{ borderRadius: '8px' }}
                                        onClick={handleEndEmployment}
                                        disabled={loading}
                                    >
                                        End Employment
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Form Fields */}
                        <div className="row g-3">
                            <div className="col-12">
                                <InputField
                                    label="Job Title / Role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    placeholder="e.g. Electrician"
                                    disabled={!canEdit && !isAddMode}
                                    sm
                                />
                            </div>
                            <div className="col-12">
                                <InputField
                                    label="Company Name"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="e.g. ABC Pvt Ltd"
                                    disabled={!canEdit && !isAddMode}
                                    sm
                                />
                            </div>
                            <div className="col-6">
                                <InputField
                                    label="Start Date"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    disabled={!canEdit && !isAddMode}
                                    sm
                                />
                            </div>
                            <div className="col-6">
                                <InputField
                                    label="End Date"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    disabled={formData.isCurrent || (!canEdit && !isAddMode)}
                                    sm
                                />
                            </div>
                            {(canEdit || isAddMode) && (
                                <div className="col-12">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="isCurrent"
                                            id="modalExpCurrent"
                                            checked={formData.isCurrent}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label small" style={{ color: 'var(--text-muted)' }} htmlFor="modalExpCurrent">
                                            Currently working here
                                        </label>
                                    </div>
                                </div>
                            )}
                            <div className="col-12">
                                <TextAreaField
                                    label="Description (Optional)"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Describe your role..."
                                    disabled={!canEdit && !isAddMode}
                                    sm
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer border-0 pt-0">
                        {/* Delete button - only for unverified */}
                        {!isAddMode && canEdit && (
                            <button
                                className="btn btn-outline-danger me-auto"
                                style={{ borderRadius: '10px' }}
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                <i className="bi bi-trash me-1"></i>Delete
                            </button>
                        )}
                        <button className="btn" style={{ color: 'var(--text-muted)' }} onClick={onClose}>Cancel</button>
                        {(canEdit || isAddMode) && (
                            <Button onClick={handleSave} loading={loading} style={{ borderRadius: '10px' }}>
                                {isAddMode ? 'Add Experience' : 'Save Changes'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkExperienceModal;
