import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { profileAPI } from '../services/api';
import { formatDate, formatSalary, getInitials } from '../utils/index';

function WorkerProfilePage() {
    const { userId } = useParams();
    const [searchParams] = useSearchParams();
    const fromJobId = searchParams.get('fromJob');
    const isOwnProfile = !userId;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [workHistory, setWorkHistory] = useState([]);
    const [completionPercent, setCompletionPercent] = useState(0);
    const isEmployer = profile?.role === 'employer';
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = isOwnProfile ? await profileAPI.getMyProfile() : await profileAPI.getByUserId(userId);
                setProfile(data);
                setWorkHistory(data.workHistory || []);
                setCompletionPercent(calculateCompletion(data));
            } catch (err) {
                if (err.response?.status === 404 && isOwnProfile) {
                    navigate('/profile/edit');
                } else {
                    console.error("Failed to fetch profile", err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate, userId, isOwnProfile]);

    const calculateCompletion = (p) => {
        if (!p) return 0;

        if (p.role === 'employer') {
            let score = 0;
            if (p.name) score += 25;
            if (p.phone) score += 25;
            if (p.designation) score += 25;
            if (p.company) score += 25;
            return Math.min(score, 100);
        }

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



    const getAge = (dob) => {
        if (!dob) return 0;
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };
    const ExperienceCard = ({ exp }) => (
        <div className="card mb-3 border-0 shadow-sm p-3" style={{ borderRadius: '16px', background: 'var(--bg-card)' }}>
            <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex gap-3 w-100">
                    <div className="rounded-3 bg-primary bg-opacity-10 p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-briefcase-fill text-primary fs-4"></i>
                    </div>
                    <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 className="fw-bold mb-0">{exp.role}</h6>
                                <p className="text-muted mb-1 small">{exp.companyName || exp.company?.name}</p>
                            </div>
                            {exp.isVerified && (
                                <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2">
                                    <i className="bi bi-patch-check-fill me-1"></i> Verified
                                </span>
                            )}
                        </div>

                        <div className="small text-muted mb-2">
                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                        </div>
                        {exp.description && (
                            <p className="small text-muted mb-0 mt-2" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

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
            {fromJobId && (
                <div className="mb-4">
                    <Link to={`/jobs/${fromJobId}/applicants`} className="text-decoration-none d-inline-flex align-items-center"
                        style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        ← Back to Applicants
                    </Link>
                </div>
            )}
            {isOwnProfile && !isEmployer && completionPercent < 100 && (
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
                                                {getInitials(profile.name)}
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
                                        {isEmployer ? (
                                            <>
                                                {profile.company?.name && <><i className="bi bi-building me-1"></i>{profile.company.name}<span className="mx-2">•</span></>}
                                                <i className="bi bi-telephone me-1"></i>{profile.phone}
                                                {profile.phoneVerified && <i className="bi bi-patch-check-fill ms-1 text-success" title="Verified"></i>}
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-geo-alt me-1"></i>{profile.city}, {profile.state}
                                                <span className="mx-2">•</span>
                                                <i className="bi bi-calendar3 me-1"></i>{getAge(profile.dob)} years old
                                            </>
                                        )}
                                        <span className="mx-2">•</span>
                                        <i className="bi bi-briefcase me-1"></i>
                                        {isEmployer ? (profile.designation || 'Employer') : `${profile.totalExperienceYears} years exp`}
                                    </p>
                                    <p className="mb-3" style={{ color: 'var(--text-muted)' }}>{profile.bio}</p>

                                    <div className="d-flex flex-wrap gap-2">
                                        {isOwnProfile && (
                                            <Link to="/profile/edit" className="btn rounded-pill px-4"
                                                style={{ background: 'var(--text-main)', color: 'var(--bg-body)' }}>
                                                <i className="bi bi-pencil me-2"></i>Edit Profile
                                            </Link>
                                        )}
                                        <button className="btn btn-outline-secondary rounded-pill px-4">
                                            <i className="bi bi-share me-2"></i>Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isEmployer && (
                        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                        <i className="bi bi-tools me-2"></i>Skills
                                    </h5>
                                    {isOwnProfile && (
                                        <Link to="/profile/edit" className="btn btn-sm btn-link text-decoration-none" style={{ color: 'var(--primary-600)' }}>
                                            <i className="bi bi-plus-lg me-1"></i>Add
                                        </Link>
                                    )}
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
                    )}

                    {isEmployer && (
                        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>
                                    <i className="bi bi-grid me-2"></i>Quick Actions
                                </h5>
                                <div className="d-flex flex-column gap-3">
                                    <Link to="/post-job" className="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none"
                                        style={{ background: 'var(--bg-surface)', transition: 'all 0.2s' }}>
                                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{ width: '44px', height: '44px', background: 'rgba(99, 102, 241, 0.1)' }}>
                                            <i className="bi bi-plus-lg" style={{ color: 'var(--primary-600)' }}></i>
                                        </div>
                                        <div>
                                            <p className="mb-0 fw-semibold" style={{ color: 'var(--text-main)' }}>Post a New Job</p>
                                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Find workers for your business</p>
                                        </div>
                                    </Link>
                                    <Link to="/my-jobs" className="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none"
                                        style={{ background: 'var(--bg-surface)', transition: 'all 0.2s' }}>
                                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{ width: '44px', height: '44px', background: 'rgba(34, 197, 94, 0.1)' }}>
                                            <i className="bi bi-briefcase" style={{ color: '#22c55e' }}></i>
                                        </div>
                                        <div>
                                            <p className="mb-0 fw-semibold" style={{ color: 'var(--text-main)' }}>View My Jobs</p>
                                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Manage your job listings</p>
                                        </div>
                                    </Link>
                                    <Link to="/my-team" className="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none"
                                        style={{ background: 'var(--bg-surface)', transition: 'all 0.2s' }}>
                                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{ width: '44px', height: '44px', background: 'rgba(59, 130, 246, 0.1)' }}>
                                            <i className="bi bi-people" style={{ color: '#3b82f6' }}></i>
                                        </div>
                                        <div>
                                            <p className="mb-0 fw-semibold" style={{ color: 'var(--text-main)' }}>My Team</p>
                                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Manage your hired workers</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isEmployer && (
                        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                        <i className="bi bi-briefcase me-2"></i>Work History
                                    </h5>
                                    {isOwnProfile && (
                                        <Link to="/profile/edit?step=4" className="btn btn-sm btn-link text-decoration-none" style={{ color: 'var(--primary-600)' }}>
                                            <i className="bi bi-plus-lg me-1"></i>Add Experience
                                        </Link>
                                    )}
                                </div>

                                <div className="d-flex flex-column gap-3">
                                    {workHistory.length > 0 ? (
                                        workHistory.map((work) => (
                                            <ExperienceCard key={work._id} exp={work} />
                                        ))
                                    ) : (
                                        <p className="text-muted small fst-italic">No work history added.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
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

                    {!isEmployer && (
                        <>
                            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>
                                        <i className="bi bi-currency-rupee me-2"></i>Expected Salary
                                    </h5>
                                    <p className="mb-0 fs-4 fw-bold" style={{ color: 'var(--text-main)' }}>
                                        {formatSalary(profile.expectedSalary?.min, profile.expectedSalary?.max, profile.expectedSalary?.type)}
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
                                            ) : isOwnProfile ? (
                                                <button className="btn btn-sm btn-link text-decoration-none p-0" style={{ color: 'var(--primary-600)' }}>
                                                    <i className="bi bi-plus-lg me-1"></i>Add
                                                </button>
                                            ) : null}
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
                                            ) : isOwnProfile ? (
                                                <button className="btn btn-sm btn-link text-decoration-none p-0" style={{ color: 'var(--primary-600)' }}>
                                                    <i className="bi bi-plus-lg me-1"></i>Add
                                                </button>
                                            ) : null}
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
                                            ) : isOwnProfile ? (
                                                <button className="btn btn-sm btn-link text-decoration-none p-0" style={{ color: 'var(--primary-600)' }}>
                                                    <i className="bi bi-plus-lg me-1"></i>Add
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WorkerProfilePage;
