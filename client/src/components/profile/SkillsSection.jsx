import { memo } from 'react';
import { Link } from 'react-router-dom';

const cardStyle = { borderRadius: '20px', background: 'var(--bg-card)' };
const badgeStyle = { background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.9rem' };

const SkillsSection = memo(({ skills, isOwnProfile }) => (
    <div className="card border-0 shadow-sm mb-4" style={cardStyle}>
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
                {skills?.length > 0 ? (
                    skills.map((skill, i) => (
                        <span key={i} className="badge rounded-pill px-3 py-2" style={badgeStyle}>
                            {skill}
                        </span>
                    ))
                ) : (
                    <p className="text-muted small fst-italic">No skills added yet.</p>
                )}
            </div>
        </div>
    </div>
));

export default SkillsSection;
