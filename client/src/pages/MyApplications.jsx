import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


function MyApplications() {
    const { token } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawing, setWithdrawing] = useState(null);
    const [selectedApp, setSelectedApp] = useState(null);

    const handleWithdraw = async (appId) => {
        if (!window.confirm('Are you sure you want to withdraw this application?')) {
            return;
        }
        setWithdrawing(appId);
        try {
            await axios.delete(`/api/applications/${appId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setApplications(applications.filter(app => app._id !== appId));
        } catch (error) {
            alert("Failed to withdraw application");
        } finally {
            setWithdrawing(null);
        }
    };

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get('/api/applications/my-applications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApplications(res.data);
            } catch (error) {
                console.error("Error fetching applications: ", error);
            } finally {
                setLoading(false);
            }
        }
        fetchApplications();
    }, [token]);
    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: 'rgba(251, 191, 36, 0.1)', color: '#f59e0b', icon: 'bi-clock-fill' },
            viewed: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: 'bi-eye-fill' },
            shortlisted: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: 'bi-star-fill' },
            rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: 'bi-x-circle-fill' },
            hired: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', icon: 'bi-trophy-fill' }
        };
        const s = styles[status] || styles.pending;
        return (
            <span className="badge rounded-pill px-3 py-2" style={{ background: s.bg, color: s.color }}>
                <i className={`bi ${s.icon} me-1`}></i>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status"></div>
            </div>
        );
    } return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>
                <i className="bi bi-file-text me-2" style={{ color: 'var(--primary-500)' }}></i>
                My Applications
            </h2>
            {applications.length === 0 ? (
                <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                    <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                    <p>You haven't applied to any jobs yet.</p>
                    <Link to="/" className="btn rounded-pill px-4 py-2"
                        style={{ background: 'var(--primary-500)', color: 'white' }}>
                        Browse Jobs
                    </Link>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {applications.map(app => (
                        <div key={app._id} className="d-flex align-items-center p-4"
                            style={{
                                background: 'var(--bg-card)',
                                borderRadius: '50px',
                                border: '1px solid var(--border-color)'
                            }}>
                            <div className="flex-grow-1">
                                <div className="row align-items-center">
                                    <div className="col-lg-6 mb-2 mb-lg-0">
                                        <h5 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                                            {app.job?.title || 'Job Deleted'}
                                        </h5>
                                        <div className="d-flex flex-wrap gap-3" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <span><i className="bi bi-geo-alt me-1"></i>{app.job?.city}, {app.job?.state}</span>
                                            <span><i className="bi bi-currency-rupee me-1"></i>
                                                {app.job?.salaryMin?.toLocaleString()}{app.job?.salaryMax ? `-${app.job.salaryMax.toLocaleString()}` : '+'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="d-flex gap-3 align-items-center">
                                            {getStatusBadge(app.status)}
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                <i className="bi bi-calendar3 me-1"></i>
                                                {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2 ms-3">
                                <button
                                    onClick={() => setSelectedApp(app)}
                                    className="d-flex align-items-center justify-content-center rounded-pill px-3 py-2 btn-action-view"
                                    style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.85rem', transition: 'all 0.2s ease', cursor: 'pointer' }}
                                    onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.background = 'var(--primary-500)'; e.target.style.color = 'white'; e.target.style.borderColor = 'var(--primary-500)'; }}
                                    onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.background = 'var(--bg-surface)'; e.target.style.color = 'var(--text-main)'; e.target.style.borderColor = 'var(--border-color)'; }}>
                                    <i className="bi bi-eye-fill me-1"></i> View
                                </button>
                                <button
                                    onClick={() => handleWithdraw(app._id)}
                                    disabled={withdrawing === app._id}
                                    className="d-flex align-items-center justify-content-center rounded-pill px-3 py-2 border-0"
                                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.85rem', transition: 'all 0.2s ease', cursor: 'pointer' }}
                                    onMouseEnter={e => { if (!e.target.disabled) { e.target.style.transform = 'scale(1.05)'; e.target.style.background = '#ef4444'; e.target.style.color = 'white'; } }}
                                    onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.background = 'rgba(239, 68, 68, 0.15)'; e.target.style.color = '#ef4444'; }}>
                                    {withdrawing === app._id ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <><i className="bi bi-x-lg me-1"></i> Withdraw</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {selectedApp && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedApp(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content position-relative" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                            <button onClick={() => setSelectedApp(null)}
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
                                    <span><i className="bi bi-currency-rupee me-1"></i>
                                        {selectedApp.job?.salaryMin?.toLocaleString()}{selectedApp.job?.salaryMax ? `-${selectedApp.job.salaryMax.toLocaleString()}` : '+'}
                                    </span>
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
                                        {new Date(selectedApp.appliedAt).toLocaleDateString('en-GB')}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <Link to={`/?openJob=${selectedApp.job?._id}`} className="btn rounded-pill px-4 w-100"
                                    style={{ background: 'var(--primary-500)', color: 'white', textDecoration: 'none', transition: 'all 0.2s ease' }}
                                    onMouseEnter={e => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)'; }}
                                    onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}>
                                    <i className="bi bi-box-arrow-up-right me-1"></i> View Full Job
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default MyApplications;