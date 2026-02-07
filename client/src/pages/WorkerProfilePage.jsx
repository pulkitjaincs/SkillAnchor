import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function WorkerProfilePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [workHistory, setWorkHistory] = useState([]);
    const [completionPercent, setCompletionPercent] = useState(0);

    const calculateCompletion = (p) => {
        if (!p) return 0;
        let score = 0;

        if (p.name) score += 10;
        if (p.gender) score += 10;
        if (p.phone) score += 10;
        if (p.city && p.state) score += 10;

        if (p.skills?.length > 0) score += 15;
        if (p.languages?.length > 0) score += 10;
        if (p.bio) score += 10;
        if (p.expectedSalary?.min) score += 10;

        if (p.dob) score += 5;
        if (p.documents?.aadhaar?.number) score += 5;
        if (p.documents?.pan?.number) score += 5;

        return Math.min(score, 100);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/profile/my-profile');
                setProfile(res.data);
                setWorkHistory(res.data.workHistory || []);
                setCompletionPercent(calculateCompletion(res.data));
            } catch (err) {
                if (err.response?.status === 404) {
                    navigate('/profile/edit');
                } else {
                    console.error("Failed to fetch profile", err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Present';
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    };

    const getAge = (dob) => {
        if (!dob) return 0;
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
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

    if (!profile) {
        navigate('/profile/edit');
        return;
    }

    return (
        <div className="container py-4">
            {completionPercent < 100 && (
                <div className="alert mb-4 d-flex align-items-center justify-content-between"
                    style={{ background: 'linear-gradient(135deg, var(--primary-100), var(--zinc-100))', border: 'none', borderRadius: '16px' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{ width: '48px', height: '48px', background: 'var(--bg-card)' }}>
                            <span className="fw-bold" style={{ color: 'var(--text-main)' }}>{completionPercent}%</span>
                        </div>
                        <div>
                            <p className="mb-0 fw-semibold" style={{ color: 'var(--text-main)' }}>Complete your profile</p>
                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>A complete profile increases your chances of getting hired</p>
                        </div>
                    </div>
                    <Link to="/profile/edit" className="btn btn-dark rounded-pill px-4">Complete Now</Link>
                </div>
            )}

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                        <div className="card-body p-4">
                            <div className="d-flex flex-column flex-md-row align-items-start gap-4">
                                <div className="position-relative">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, var(--primary-100), var(--zinc-100))' }}>
                                        {profile.avatar ? (
                                            <img src={profile.avatar} alt={profile.name} className="rounded-circle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span className="fw-bold" style={{ fontSize: '48px', color: 'var(--text-main)' }}>
                                                {profile.name?.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    {profile.documents?.aadhaar?.verified && (
                                        <div className="position-absolute bottom-0 end-0 bg-success rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px' }} title="Aadhaar Verified">
                                            <i className="bi bi-patch-check-fill text-white"></i>
                                        </div>
                                    )}
                                </div>


                                <div className="flex-grow-1">
                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{profile.name}</h2>
                                        {profile.documents?.aadhaar?.verified && (
                                            <span className="badge bg-success-subtle text-success rounded-pill">
                                                <i className="bi bi-patch-check-fill me-1"></i>Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="mb-2" style={{ color: 'var(--text-muted)' }}>
                                        <i className="bi bi-geo-alt me-1"></i>{profile.city}, {profile.state}
                                        <span className="mx-2">•</span>
                                        <i className="bi bi-calendar3 me-1"></i>{getAge(profile.dob)} years old
                                        <span className="mx-2">•</span>
                                        <i className="bi bi-briefcase me-1"></i>{profile.totalExperienceYears} years exp
                                    </p>
                                    <p className="mb-3" style={{ color: 'var(--text-muted)' }}>{profile.bio}</p>

                                    <div className="d-flex flex-wrap gap-2">
                                        <Link to="/profile/edit" className="btn rounded-pill px-4"
                                            style={{ background: 'var(--text-main)', color: 'var(--bg-body)' }}>
                                            <i className="bi bi-pencil me-2"></i>Edit Profile
                                        </Link>
                                        <button className="btn btn-outline-secondary rounded-pill px-4">
                                            <i className="bi bi-share me-2"></i>Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                    <i className="bi bi-tools me-2"></i>Skills
                                </h5>
                                <Link to="/profile/edit" className="btn btn-sm btn-link text-decoration-none" style={{ color: 'var(--primary-600)' }}>
                                    <i className="bi bi-plus-lg me-1"></i>Add
                                </Link>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                {profile.skills?.length > 0 ? (
                                    profile.skills.map((skill, i) => (
                                        <span key={i} className="badge rounded-pill px-3 py-2"
                                            style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-muted small fst-italic">No skills added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                    <i className="bi bi-briefcase me-2"></i>Work History
                                </h5>
                                <button className="btn btn-sm btn-link text-decoration-none" style={{ color: 'var(--primary-600)' }}>
                                    <i className="bi bi-plus-lg me-1"></i>Add Experience
                                </button>
                            </div>

                            <div className="d-flex flex-column gap-3">
                                {workHistory.length > 0 ? (
                                    workHistory.map((work) => (
                                        <div key={work._id} className="p-3 rounded-3"
                                            style={{ background: 'var(--bg-surface)', opacity: work.isVisible ? 1 : 0.6 }}>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                                        <h6 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{work.role}</h6>
                                                        {work.isCurrent && (
                                                            <span className="badge bg-primary-subtle text-primary rounded-pill">Current</span>
                                                        )}
                                                        {work.isVerified && (
                                                            <span className="badge bg-success-subtle text-success rounded-pill">
                                                                <i className="bi bi-patch-check-fill me-1"></i>Verified
                                                            </span>
                                                        )}
                                                        {!work.isVisible && (
                                                            <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                                                                <i className="bi bi-eye-slash me-1"></i>Hidden
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mb-1" style={{ color: 'var(--text-muted)' }}>
                                                        <i className="bi bi-building me-1"></i>{work.company?.name || 'Unknown Company'}
                                                    </p>
                                                    <p className="mb-2 small" style={{ color: 'var(--text-muted)' }}>
                                                        <i className="bi bi-calendar3 me-1"></i>
                                                        {formatDate(work.startDate)} - {formatDate(work.endDate)}
                                                    </p>
                                                    {work.skills?.length > 0 && (
                                                        <div className="d-flex flex-wrap gap-1 mb-2">
                                                            {work.skills.map((skill, i) => (
                                                                <span key={i} className="badge rounded-pill"
                                                                    style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {work.rating && (
                                                        <div className="d-flex align-items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <i key={i} className={`bi bi-star${i < work.rating ? '-fill' : ''}`}
                                                                    style={{ color: i < work.rating ? '#fbbf24' : 'var(--text-muted)', fontSize: '0.875rem' }}></i>
                                                            ))}
                                                            {work.review && (
                                                                <span className="ms-2 small fst-italic" style={{ color: 'var(--text-muted)' }}>
                                                                    "{work.review}"
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-sm btn-link p-1" title={work.isVisible ? 'Hide' : 'Show'}
                                                        style={{ color: 'var(--text-muted)' }}>
                                                        <i className={`bi bi-eye${work.isVisible ? '' : '-slash'}`}></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-link p-1" title="Edit"
                                                        style={{ color: 'var(--text-muted)' }}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted small fst-italic">No work history added.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>
                                <i className="bi bi-person-lines-fill me-2"></i>Contact
                            </h5>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="d-flex align-items-center justify-content-center rounded-circle"
                                        style={{ width: '40px', height: '40px', background: 'var(--bg-surface)' }}>
                                        <i className="bi bi-telephone" style={{ color: 'var(--text-main)' }}></i>
                                    </div>
                                    <div>
                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Phone</p>
                                        <p className="mb-0 fw-medium" style={{ color: 'var(--text-main)' }}>+91 {profile.phone}</p>
                                    </div>
                                </div>
                                {profile.whatsapp && (
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{ width: '40px', height: '40px', background: 'rgba(37, 211, 102, 0.1)' }}>
                                            <i className="bi bi-whatsapp" style={{ color: '#25d366' }}></i>
                                        </div>
                                        <div>
                                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>WhatsApp</p>
                                            <p className="mb-0 fw-medium" style={{ color: 'var(--text-main)' }}>+91 {profile.whatsapp}</p>
                                        </div>
                                    </div>
                                )}
                                {profile.email && (
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{ width: '40px', height: '40px', background: 'var(--bg-surface)' }}>
                                            <i className="bi bi-envelope" style={{ color: 'var(--text-main)' }}></i>
                                        </div>
                                        <div>
                                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Email</p>
                                            <p className="mb-0 fw-medium" style={{ color: 'var(--text-main)' }}>{profile.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>
                                <i className="bi bi-currency-rupee me-2"></i>Expected Salary
                            </h5>
                            <p className="mb-1 fs-4 fw-bold" style={{ color: 'var(--text-main)' }}>
                                ₹{profile.expectedSalary?.min?.toLocaleString()}{profile.expectedSalary?.max ? ` - ₹${profile.expectedSalary.max.toLocaleString()}` : '+'}
                            </p>
                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>
                                per {profile.expectedSalary?.type === 'monthly' ? 'month' : 'day'}
                            </p>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>
                                <i className="bi bi-translate me-2"></i>Languages
                            </h5>
                            <div className="d-flex flex-wrap gap-2">
                                {profile.languages?.map((lang, i) => (
                                    <span key={i} className="badge rounded-pill px-3 py-2"
                                        style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>
                                <i className="bi bi-file-earmark-text me-2"></i>Documents
                            </h5>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--bg-surface)' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-credit-card-2-front" style={{ color: 'var(--text-main)' }}></i>
                                        <span style={{ color: 'var(--text-main)' }}>Aadhaar</span>
                                    </div>
                                    {profile.documents?.aadhaar?.verified ? (
                                        <span className="badge bg-success rounded-pill">
                                            <i className="bi bi-check-lg me-1"></i>Verified
                                        </span>
                                    ) : profile.documents?.aadhaar?.number ? (
                                        <span className="badge bg-warning text-dark rounded-pill">Pending</span>
                                    ) : (
                                        <button className="btn btn-sm btn-link text-decoration-none p-0" style={{ color: 'var(--primary-600)' }}>
                                            <i className="bi bi-plus-lg me-1"></i>Add
                                        </button>
                                    )}
                                </div>
                                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--bg-surface)' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-card-text" style={{ color: 'var(--text-main)' }}></i>
                                        <span style={{ color: 'var(--text-main)' }}>PAN Card</span>
                                    </div>
                                    {profile.documents?.pan?.verified ? (
                                        <span className="badge bg-success rounded-pill">
                                            <i className="bi bi-check-lg me-1"></i>Verified
                                        </span>
                                    ) : profile.documents?.pan?.number ? (
                                        <span className="badge bg-warning text-dark rounded-pill">Pending</span>
                                    ) : (
                                        <button className="btn btn-sm btn-link text-decoration-none p-0" style={{ color: 'var(--primary-600)' }}>
                                            <i className="bi bi-plus-lg me-1"></i>Add
                                        </button>
                                    )}
                                </div>
                                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--bg-surface)' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-car-front" style={{ color: 'var(--text-main)' }}></i>
                                        <span style={{ color: 'var(--text-main)' }}>Driving License</span>
                                    </div>
                                    {profile.documents?.license?.verified ? (
                                        <span className="badge bg-success rounded-pill">
                                            <i className="bi bi-check-lg me-1"></i>Verified
                                        </span>
                                    ) : profile.documents?.license?.number ? (
                                        <span className="badge bg-warning text-dark rounded-pill">Pending</span>
                                    ) : (
                                        <button className="btn btn-sm btn-link text-decoration-none p-0" style={{ color: 'var(--primary-600)' }}>
                                            <i className="bi bi-plus-lg me-1"></i>Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkerProfilePage;
