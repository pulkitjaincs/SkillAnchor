import { memo } from 'react';
import { Link } from 'react-router-dom';
import { getInitials } from '../../utils/index';

const avatarContainerStyle = {
    width: '120px', height: '120px',
    background: 'linear-gradient(135deg, var(--primary-100), var(--zinc-100))'
};
const avatarImgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const verifiedBadgeStyle = { width: '32px', height: '32px' };
const editBtnStyle = { background: 'var(--text-main)', color: 'var(--bg-body)' };

const ProfileHeader = memo(({ profile, isOwnProfile, isEmployer, completionPercent, getAge }) => (
    <>
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

        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'var(--bg-card)' }}>
            <div className="card-body p-4">
                <div className="d-flex flex-column flex-md-row align-items-start gap-4">
                    <div className="position-relative">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={avatarContainerStyle}>
                            {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="rounded-circle" loading="lazy" style={avatarImgStyle} />
                            ) : (
                                <span className="fw-bold" style={{ fontSize: '48px', color: 'var(--text-main)' }}>
                                    {getInitials(profile.name)}
                                </span>
                            )}
                        </div>
                        {profile.documents?.aadhaar?.verified && (
                            <div className="position-absolute bottom-0 end-0 bg-success rounded-circle d-flex align-items-center justify-content-center"
                                style={verifiedBadgeStyle} title="Aadhaar Verified">
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
                                <Link to="/profile/edit" className="btn rounded-pill px-4" style={editBtnStyle}>
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
    </>
));

export default ProfileHeader;
