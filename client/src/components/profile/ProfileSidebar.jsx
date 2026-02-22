import { memo } from 'react';
import { formatSalary } from '../../utils/index';

const cardStyle = { borderRadius: '20px', background: 'var(--bg-card)' };
const iconContainerStyle = { width: '40px', height: '40px', background: 'var(--bg-surface)' };
const badgeStyle = { background: 'var(--bg-surface)', color: 'var(--text-main)' };

const ProfileSidebar = memo(({ profile, isEmployer, isOwnProfile }) => (
    <>
        {/* Contact Card */}
        <div className="card border-0 shadow-sm mb-4" style={cardStyle}>
            <div className="card-body p-4">
                <h5 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>
                    <i className="bi bi-person-lines-fill me-2"></i>Contact
                </h5>
                <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-circle" style={iconContainerStyle}>
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
                            <div className="d-flex align-items-center justify-content-center rounded-circle" style={iconContainerStyle}>
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
                {/* Expected Salary */}
                <div className="card border-0 shadow-sm mb-4" style={cardStyle}>
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

                {/* Languages */}
                <div className="card border-0 shadow-sm mb-4" style={cardStyle}>
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>
                            <i className="bi bi-translate me-2"></i>Languages
                        </h5>
                        <div className="d-flex flex-wrap gap-2">
                            {profile.languages?.map((lang, i) => (
                                <span key={i} className="badge rounded-pill px-3 py-2" style={badgeStyle}>
                                    {lang}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Documents */}
                <DocumentsCard profile={profile} isOwnProfile={isOwnProfile} />
            </>
        )}
    </>
));

const docSurfaceStyle = { background: 'var(--bg-surface)' };

const DocumentsCard = memo(({ profile, isOwnProfile }) => (
    <div className="card border-0 shadow-sm" style={cardStyle}>
        <div className="card-body p-4">
            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>
                <i className="bi bi-file-earmark-text me-2"></i>Documents
            </h5>
            <div className="d-flex flex-column gap-3">
                {[
                    { key: 'aadhaar', label: 'Aadhaar', icon: 'bi-credit-card-2-front' },
                    { key: 'pan', label: 'PAN Card', icon: 'bi-card-text' },
                    { key: 'license', label: 'Driving License', icon: 'bi-car-front' },
                ].map(doc => (
                    <div key={doc.key} className="d-flex align-items-center justify-content-between p-3 rounded-3" style={docSurfaceStyle}>
                        <div className="d-flex align-items-center gap-2">
                            <i className={`bi ${doc.icon}`} style={{ color: 'var(--text-main)' }}></i>
                            <span style={{ color: 'var(--text-main)' }}>{doc.label}</span>
                        </div>
                        {profile.documents?.[doc.key]?.verified ? (
                            <span className="badge bg-success rounded-pill">
                                <i className="bi bi-check-lg me-1"></i>Verified
                            </span>
                        ) : profile.documents?.[doc.key]?.number ? (
                            <span className="badge bg-warning text-dark rounded-pill">Pending</span>
                        ) : isOwnProfile ? (
                            <button className="btn btn-sm btn-link text-decoration-none p-0" style={{ color: 'var(--primary-600)' }}>
                                <i className="bi bi-plus-lg me-1"></i>Add
                            </button>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    </div>
));

export { DocumentsCard };
export default ProfileSidebar;
