import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


function JobApplicantsPage() {
    const { jobId } = useParams();
    const { token } = useAuth();
    const [applications, setApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobRes = await axios.get(`/api/jobs/${jobId}`);
                setJob(jobRes.data);
                const appRes = await axios.get(`/api/applications/job/${jobId}`,
                    { headers: { Authorization: `Bearer ${token}` } });
                setApplications(appRes.data);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [jobId, token]);
    const handleStatusChange = async (appId, newStatus) => {
        setUpdating(appId);
        try {
            await axios.patch(`/api/applications/${appId}/status`, { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } });
            setApplications(applications.map(app =>
                app._id === appId ? { ...app, status: newStatus } : app));
        } catch (error) {
            alert("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };
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
    }

    return (
        <div className="container py-5">
            <div className="mb-4">
                <Link to="/my-jobs" className="text-decoration-none d-inline-flex align-items-center mb-3"
                    style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    ← Back to My Jobs
                </Link>
                <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                    <i className="bi bi-people-fill me-2" style={{ color: 'var(--primary-500)' }}></i>
                    Applicants
                </h2>
                {job && (
                    <p style={{ color: 'var(--text-muted)' }}>
                        For: <strong style={{ color: 'var(--text-main)' }}>{job.title}</strong> — {job.city}, {job.state}
                    </p>
                )}
            </div>
            {applications.length === 0 ? (
                <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                    <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                    <p>No applications yet for this job.</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {applications.map(app => (
                        <div key={app._id} className="p-4"
                            style={{
                                background: 'var(--bg-card)',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)'
                            }}>
                            <div className="row align-items-center">
                                <div className="col-lg-5 mb-3 mb-lg-0">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                background: 'var(--primary-500)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '1.1rem',
                                                flexShrink: 0
                                            }}>
                                            {app.applicant?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <Link to={`/profile/${app.applicant?._id}?fromJob=${jobId}`} className="text-decoration-none">
                                                <h5 className="fw-bold mb-1" style={{ color: 'var(--text-main)', fontSize: '1rem' }}>
                                                    {app.applicant?.name || 'Unknown'}
                                                </h5>
                                            </Link>
                                            <div className="d-flex flex-wrap gap-3" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {app.applicant?.phone && (
                                                    <span><i className="bi bi-telephone me-1"></i>{app.applicant.phone}</span>
                                                )}
                                                {app.applicant?.email && (
                                                    <span><i className="bi bi-envelope me-1"></i>{app.applicant.email}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-3 mb-lg-0">
                                    <div className="d-flex align-items-center gap-3">
                                        {getStatusBadge(app.status)}
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            <i className="bi bi-calendar3 me-1"></i>
                                            {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                </div>                                <div className="col-lg-3">
                                    <div className="d-flex gap-2 justify-content-lg-end">
                                        <select
                                            value={app.status}
                                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                            disabled={updating === app._id}
                                            className="form-select form-select-sm rounded-3"
                                            style={{
                                                background: 'var(--bg-surface)',
                                                color: 'var(--text-main)',
                                                border: '1px solid var(--border-color)',
                                                maxWidth: '150px'
                                            }}>
                                            <option value="pending">Pending</option>
                                            <option value="viewed">Viewed</option>
                                            <option value="shortlisted">Shortlisted</option>
                                            <option value="hired">Hired</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {/* Cover Note */}
                            {app.coverNote && (
                                <div className="mt-3 p-3 rounded-3" style={{ background: 'var(--bg-surface)' }}>
                                    <small style={{ color: 'var(--text-muted)' }}>Cover Note:</small>
                                    <p className="mb-0 mt-1" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                        {app.coverNote}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
export default JobApplicantsPage;