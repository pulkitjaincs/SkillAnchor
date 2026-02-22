import { memo } from 'react';
import { Link } from 'react-router-dom';

const cardStyle = { borderRadius: '20px', background: 'var(--bg-card)' };
const actionBgStyle = { background: 'var(--bg-surface)', transition: 'all 0.2s' };

const actions = [
    { to: '/post-job', iconBg: 'rgba(99, 102, 241, 0.1)', iconColor: 'var(--primary-600)', icon: 'bi-plus-lg', title: 'Post a New Job', subtitle: 'Find workers for your business' },
    { to: '/my-jobs', iconBg: 'rgba(34, 197, 94, 0.1)', iconColor: '#22c55e', icon: 'bi-briefcase', title: 'View My Jobs', subtitle: 'Manage your job listings' },
    { to: '/my-team', iconBg: 'rgba(59, 130, 246, 0.1)', iconColor: '#3b82f6', icon: 'bi-people', title: 'My Team', subtitle: 'Manage your hired workers' },
];

const EmployerQuickActions = memo(() => (
    <div className="card border-0 shadow-sm mb-4" style={cardStyle}>
        <div className="card-body p-4">
            <h5 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>
                <i className="bi bi-grid me-2"></i>Quick Actions
            </h5>
            <div className="d-flex flex-column gap-3">
                {actions.map(action => (
                    <Link key={action.to} to={action.to} className="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none" style={actionBgStyle}>
                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{ width: '44px', height: '44px', background: action.iconBg }}>
                            <i className={`bi ${action.icon}`} style={{ color: action.iconColor }}></i>
                        </div>
                        <div>
                            <p className="mb-0 fw-semibold" style={{ color: 'var(--text-main)' }}>{action.title}</p>
                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>{action.subtitle}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </div>
));

export default EmployerQuickActions;
