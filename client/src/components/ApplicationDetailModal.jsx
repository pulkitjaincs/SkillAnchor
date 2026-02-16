import { Link } from 'react-router-dom';
import { formatDate, formatSalary } from '../utils/index';

function ApplicationDetailModal({ selectedApp, onClose, getStatusBadge }) {
    if (!selectedApp) return null;

    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <div className="modal-content position-relative" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                    <button onClick={onClose}
                        className="btn position-absolute p-0"
                        style={{ top: '12px', right: '12px', color: 'var(--text-muted)', background: 'transparent', border: 'none', fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1, transition: 'color 0.2s ease', zIndex: 10 }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                        ×
                    </button>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ color: 'var(--text-main)' }}>
                            {selectedApp.job?.title}
                        </h5>
                    </div>
                    <div className="modal-body">
                        <div className="d-flex flex-wrap gap-3 mb-3" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span><i className="bi bi-geo-alt me-1"></i>{selectedApp.job?.city}, {selectedApp.job?.state}</span>
                            <span><i className="bi bi-currency-rupee me-1"></i>{formatSalary(selectedApp.job?.salaryMin, selectedApp.job?.salaryMax)}</span>
                        </div>

                        <div className="mb-3">
                            <small style={{ color: 'var(--text-muted)' }}>Status</small>
                            <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                        </div>

                        <div className="mb-3">
                            <small style={{ color: 'var(--text-muted)' }}>Your Cover Note</small>
                            <div className="p-3 mt-1 rounded-3" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                                {selectedApp.coverNote || <em style={{ color: 'var(--text-muted)' }}>No cover note provided</em>}
                            </div>
                        </div>

                        <div>
                            <small style={{ color: 'var(--text-muted)' }}>Applied On</small>
                            <div style={{ color: 'var(--text-main)' }}>
                                {formatDate(selectedApp.appliedAt)}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer border-0 pt-0">
                        <Link to={`/jobs/${selectedApp.job?._id}`} className="btn rounded-pill px-4 w-100"
                            style={{ background: 'var(--primary-500)', color: 'white', textDecoration: 'none', transition: 'all 0.2s ease' }}
                            onMouseEnter={e => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}>
                            <i className="bi bi-box-arrow-up-right me-1"></i> View Full Job
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationDetailModal;
