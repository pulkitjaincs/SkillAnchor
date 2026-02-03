import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

function MyJobsPage() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    const handleDelete = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            return;
        }
        setDeleting(jobId);
        try {
            await axios.delete(`/api/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(jobs.filter(job => job._id !== jobId));
        } catch (error) {
            alert('Failed to delete job');
        }
        setDeleting(null);
    };

    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                const res = await axios.get('/api/jobs/my-jobs', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setJobs(res.data);
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        }
        fetchMyJobs();
    }, [token]);
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status"></div>
            </div>
        );
    }
    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold" style={{ color: 'var(--text-main)' }}>My Posted Jobs</h2>
                <Link to="/post-job" className="btn rounded-pill px-4 py-2 fw-semibold post-job-btn"
                    style={{ background: 'var(--text-main)', color: 'var(--bg-body)' }}>
                    <i className="bi bi-plus-lg me-1"></i> Post New Job
                </Link>
            </div>
            {jobs.length === 0 ? (
                <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                    <i className="bi bi-briefcase fs-1 mb-3 d-block"></i>
                    <p>You haven't posted any jobs yet.</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {jobs.map(job => (
                        <div key={job._id}
                            className="p-4 position-relative"
                            style={{
                                background: 'var(--bg-card)',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)'
                            }}>

                            {/* Status indicator line */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '4px',
                                height: '60%',
                                borderRadius: '0 4px 4px 0',
                                background: job.status === 'active'
                                    ? 'linear-gradient(180deg, #22c55e, #16a34a)'
                                    : 'linear-gradient(180deg, var(--zinc-400), var(--zinc-500))'
                            }}></div>

                            <div className="row align-items-center">
                                {/* Left: Job Info */}
                                <div className="col-lg-6 mb-3 mb-lg-0">
                                    <div className="d-flex align-items-start gap-3">
                                        {/* Job Icon */}
                                        <div className="d-none d-md-flex align-items-center justify-content-center rounded-3"
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                background: 'var(--bg-surface)',
                                                border: '1px solid var(--border-color)',
                                                flexShrink: 0
                                            }}>
                                            <i className="bi bi-briefcase-fill" style={{ color: 'var(--primary-500)', fontSize: '1.25rem' }}></i>
                                        </div>

                                        <div className="flex-grow-1">
                                            <h5 className="fw-bold mb-1" style={{ color: 'var(--text-main)', fontSize: '1rem' }}>
                                                {job.title}
                                            </h5>
                                            <div className="d-flex flex-wrap gap-3" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                <span><i className="bi bi-geo-alt me-1"></i>{job.city}, {job.state}</span>
                                                <span><i className="bi bi-currency-rupee me-1"></i>{job.salaryMin?.toLocaleString()}{job.salaryMax ? `-${job.salaryMax.toLocaleString()}` : '+'}</span>
                                                <span><i className="bi bi-calendar3 me-1"></i>{new Date(job.createdAt).toLocaleDateString('en-GB')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Center: Stats */}
                                <div className="col-lg-3 mb-3 mb-lg-0">
                                    <div className="d-flex gap-2 justify-content-lg-center">
                                        <span className="badge rounded-pill px-3 py-2" style={{
                                            background: job.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                                            color: job.status === 'active' ? '#22c55e' : 'var(--text-muted)',
                                            border: `1px solid ${job.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'}`,
                                            fontSize: '0.75rem'
                                        }}>
                                            <i className={`bi ${job.status === 'active' ? 'bi-check-circle-fill' : 'bi-pause-circle-fill'} me-1`}></i>
                                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                        </span>
                                        <span className="badge rounded-pill px-3 py-2" style={{
                                            background: 'var(--bg-surface)',
                                            color: 'var(--text-muted)',
                                            border: '1px solid var(--border-color)',
                                            fontSize: '0.75rem'
                                        }}>
                                            <i className="bi bi-people-fill me-1"></i>
                                            {job.applicationsCount || 0} applicants
                                        </span>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="col-lg-3">
                                    <div className="d-flex gap-2 justify-content-lg-end flex-wrap">
                                        <Link to={`/jobs/${job._id}`}
                                            className="btn btn-sm rounded-3 px-3 py-2 btn-view-action d-flex align-items-center gap-1"
                                            style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                                            <i className="bi bi-eye-fill"></i>
                                            <span className="d-none d-sm-inline">View</span>
                                        </Link>
                                        <Link to={`/edit-job/${job._id}`}
                                            className="btn btn-sm rounded-3 px-3 py-2 btn-edit-action d-flex align-items-center gap-1"
                                            style={{ background: 'var(--primary-500)', color: 'white', border: 'none' }}>
                                            <i className="bi bi-pencil-fill"></i>
                                            <span className="d-none d-sm-inline">Edit</span>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(job._id)}
                                            disabled={deleting === job._id}
                                            className="btn btn-sm rounded-3 px-3 py-2 btn-delete-action d-flex align-items-center gap-1"
                                            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
                                            {deleting === job._id ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <>
                                                    <i className="bi bi-trash-fill"></i>
                                                    <span className="d-none d-sm-inline">Delete</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyJobsPage;