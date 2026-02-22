import { memo } from 'react';
import { formatDate } from '../../utils/index';

const cardStyle = { borderRadius: '20px', background: 'var(--bg-card)' };

const WorkHistorySection = memo(({ workHistory, isOwnProfile, onAddClick, onExpClick }) => (
    <div className="card border-0 shadow-sm mb-4" style={cardStyle}>
        <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                    <i className="bi bi-briefcase me-2"></i>Work History
                </h5>
                {isOwnProfile && (
                    <button className="btn btn-sm btn-link text-decoration-none" style={{ color: 'var(--primary-600)' }} onClick={onAddClick}>
                        <i className="bi bi-plus-lg me-1"></i>Add Experience
                    </button>
                )}
            </div>

            <div className="d-flex flex-column gap-3">
                {workHistory.length > 0 ? (
                    [...workHistory]
                        .filter(exp => exp.isVisible || isOwnProfile)
                        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                        .map((exp) => (
                            <div key={exp._id} className="p-3 rounded-3"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: exp.isVerified ? '1px solid #10b981' : '1px solid var(--border-color)',
                                    cursor: isOwnProfile ? 'pointer' : 'default',
                                    opacity: (exp.isVisible === false && isOwnProfile) ? 0.6 : 1
                                }}
                                onClick={() => isOwnProfile && onExpClick(exp)}
                            >
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <h6 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{exp.role}</h6>
                                            {exp.isVerified && (
                                                <span className="badge" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '0.65rem', padding: '3px 8px' }}>
                                                    <i className="bi bi-patch-check-fill me-1"></i>Verified
                                                </span>
                                            )}
                                            {exp.isVisible === false && isOwnProfile && (
                                                <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', fontSize: '0.65rem', padding: '3px 8px', border: '1px solid var(--border-color)' }}>
                                                    <i className="bi bi-eye-slash me-1"></i>Hidden
                                                </span>
                                            )}
                                        </div>
                                        {(exp.companyName || exp.company?.name) && (
                                            <p className="small text-muted mb-1">{exp.companyName || exp.company?.name}</p>
                                        )}
                                        <p className="small text-muted mb-0">
                                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                        </p>
                                        {exp.description && (
                                            <p className="small text-muted mb-0 mt-2" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                                        )}
                                    </div>
                                    {isOwnProfile && (
                                        <i className="bi bi-chevron-right" style={{ color: 'var(--text-muted)' }}></i>
                                    )}
                                </div>
                            </div>
                        ))
                ) : (
                    <p className="text-muted small fst-italic">No work history added.</p>
                )}
            </div>
        </div>
    </div>
));

export default WorkHistorySection;
