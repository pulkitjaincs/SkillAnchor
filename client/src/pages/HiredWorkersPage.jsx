import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI, workExperienceAPI } from '../services/api';
import { formatDate, getInitials } from '../utils/index';

function HiredWorkersPage() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const { data } = await profileAPI.getMyTeam();
            setTeam(data);
        } catch (err) {
            console.error("Failed to fetch team", err);
        } finally {
            setLoading(false);
        }
    };

    const endEmployment = async (id) => {
        if (!window.confirm("Are you sure you want to end this worker's employment?")) return;
        try {
            await workExperienceAPI.endEmployment(id);
            setTeam(team.filter(m => m._id !== id));
        } catch (err) {
            alert("Failed to end employment");
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--bg-body)', minHeight: '100vh', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>

                {/* Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                    <div>
                        <Link to="/profile" className="text-decoration-none text-muted small d-flex align-items-center mb-2">
                            <i className="bi bi-arrow-left me-2"></i>Back to Profile
                        </Link>
                        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)', fontSize: '2rem' }}>
                            My Team
                            <span className="badge ms-3 rounded-pill" style={{ fontSize: '0.9rem', background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '6px 16px' }}>
                                {team.length} Members
                            </span>
                        </h2>
                        <p className="text-muted mb-0 mt-1">Manage your active workers and their roles.</p>
                    </div>
                </div>

                {/* Team Grid */}
                <div className="row g-4">
                    {team.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                                style={{ width: '100px', height: '100px', background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
                                <i className="bi bi-people text-muted" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <h4 className="fw-bold mb-2">No active team members</h4>
                            <p className="text-muted">When you hire workers, they will appear here.</p>
                            <Link to="/my-jobs" className="btn btn-primary rounded-pill px-4 mt-2" style={{ background: 'var(--primary-500)', border: 'none' }}>
                                View Job Applicants
                            </Link>
                        </div>
                    ) : (
                        team.map(member => (
                            <div className="col-lg-4 col-md-6" key={member._id}>
                                <div className="card h-100 border-0 shadow-sm overflow-hidden"
                                    style={{ borderRadius: '24px', background: 'var(--bg-card)' }}>

                                    <div className="card-body p-4">
                                        {/* Member Header & Info */}
                                        <div className="d-flex align-items-center justify-content-between mb-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="position-relative">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary-100), var(--zinc-100))' }}>
                                                        {member.worker?.avatar ? (
                                                            <img src={member.worker.avatar} alt={member.worker.name} className="rounded-circle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <span className="fw-bold text-primary fs-5">{getInitials(member.worker?.name)}</span>
                                                        )}
                                                    </div>
                                                    <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white border-2"
                                                        style={{ width: '14px', height: '14px' }} title="Active"></div>
                                                </div>
                                                <div>
                                                    <h5 className="fw-bold mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{member.worker?.name || 'Unknown Member'}</h5>
                                                    <div className="d-inline-flex align-items-center gap-1 text-primary x-small fw-semibold px-2 py-0.5 rounded-pill" style={{ background: 'var(--primary-50)', fontSize: '0.7rem' }}>
                                                        <i className="bi bi-briefcase-fill" style={{ fontSize: '0.65rem' }}></i>
                                                        {member.role || 'Worker'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="dropdown">
                                                <button className="btn btn-link text-muted p-0 border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i className="bi bi-three-dots-vertical fs-5"></i>
                                                </button>
                                                <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2" style={{ borderRadius: '16px' }}>
                                                    <li>
                                                        <Link to={`/profile/${member.worker?._id}?from=team`} className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ borderRadius: '10px' }}>
                                                            <i className="bi bi-person text-secondary"></i> View Profile
                                                        </Link>
                                                    </li>
                                                    <li><hr className="dropdown-divider opacity-50" /></li>
                                                    <li>
                                                        <button onClick={() => endEmployment(member._id)} className="dropdown-item text-danger d-flex align-items-center gap-2 py-2" style={{ borderRadius: '10px' }}>
                                                            <i className="bi bi-x-circle"></i> End Employment
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Member Secondary Info */}
                                        <div className="mb-4">
                                            <div className="text-muted small d-flex align-items-center gap-2 opacity-75">
                                                <i className="bi bi-calendar-check"></i>
                                                Joined {formatDate(member.startDate)}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="d-flex gap-2 pt-2">
                                            <a href={`tel:${member.worker?.phone}`} className="btn btn-primary rounded-pill py-1.5 px-3 flex-grow-1 d-flex align-items-center justify-content-center gap-2 btn-hover-scale"
                                                style={{ background: 'var(--primary-500)', border: 'none', fontWeight: '600', fontSize: '0.8rem' }}>
                                                <i className="bi bi-telephone-fill" style={{ fontSize: '0.75rem' }}></i> Call Now
                                            </a>
                                            <Link to={`/profile/${member.worker?._id}?from=team`} className="btn rounded-pill border-0 py-2 px-3 d-flex align-items-center justify-content-center btn-hover-scale"
                                                style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }} title="Full Profile">
                                                <i className="bi bi-arrow-right-short fs-4"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default HiredWorkersPage;
