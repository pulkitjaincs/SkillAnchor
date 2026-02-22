import { useState, useMemo, lazy, Suspense } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Link } from 'react-router-dom';
import { formatDate, formatSalary } from '../utils/index';

import { useApplications, useWithdrawApplication } from '../hooks/queries/useApplications';

const ApplicationDetailModal = lazy(() => import('../components/ApplicationDetailModal'));


function MyApplications() {
    const [selectedApp, setSelectedApp] = useState(null);

    const {
        data,
        isLoading: loading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useApplications();

    const applications = useMemo(() => {
        return data?.pages.flatMap(page => page.applications) || [];
    }, [data]);
    const withdrawMutation = useWithdrawApplication();

    const handleWithdraw = async (appId) => {
        if (!window.confirm('Are you sure you want to withdraw this application?')) {
            return;
        }
        try {
            await withdrawMutation.mutateAsync(appId);
        } catch (error) {
            alert("Failed to withdraw application");
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: 'rgba(251, 191, 36, 0.1)', color: '#f59e0b', icon: 'bi-clock-fill' },
            viewed: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: 'bi-eye-fill' },
            shortlisted: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: 'bi-star-fill' },
            rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: 'bi-x-circle-fill' },
            hired: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', icon: 'bi-trophy-fill' },
            "employment-ended": { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', icon: 'bi-slash-circle-fill' }
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
            <Link to="/" className="text-decoration-none d-inline-flex align-items-center mb-3"
                style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                ← Back to Jobs
            </Link>
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
                <div className="d-flex flex-column">
                    <Virtuoso
                        useWindowScroll
                        data={applications}
                        endReached={() => {
                            if (hasNextPage) fetchNextPage();
                        }}
                        itemContent={(index, app) => (
                            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center p-3 p-sm-4 gap-3 mb-3"
                                style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                <div className="flex-grow-1 w-100">
                                    <div className="row align-items-center g-2">
                                        <div className="col-md-7">
                                            <h5 className="fw-bold mb-1 text-truncate" style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>
                                                {app.job?.title || 'Job Deleted'}
                                            </h5>
                                            <div className="d-flex flex-wrap gap-x-3 gap-y-1" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <span className="text-truncate"><i className="bi bi-geo-alt me-1"></i>{app.job?.city}, {app.job?.state}</span>
                                                <span><i className="bi bi-currency-rupee me-1"></i>{formatSalary(app.job?.salaryMin, app.job?.salaryMax)}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-5">
                                            <div className="d-flex gap-3 align-items-center flex-wrap">
                                                {getStatusBadge(app.status)}
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    <i className="bi bi-calendar3 me-1"></i>
                                                    {formatDate(app.appliedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 w-100 w-md-auto justify-content-start justify-content-md-end">
                                    <button
                                        onClick={() => setSelectedApp(app)}
                                        className="d-flex align-items-center justify-content-center rounded-pill px-3 py-2 btn-action-view flex-grow-1 flex-md-grow-0"
                                        style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.85rem', transition: 'all 0.2s ease', cursor: 'pointer' }}>
                                        <i className="bi bi-eye-fill me-1"></i> View
                                    </button>
                                    <button
                                        onClick={() => handleWithdraw(app._id)}
                                        disabled={withdrawMutation.isLoading || !['pending', 'viewed'].includes(app.status)}
                                        className="d-flex align-items-center justify-content-center rounded-pill px-3 py-2 border-0 flex-grow-1 flex-md-grow-0"
                                        style={{
                                            background: ['pending', 'viewed'].includes(app.status) ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-surface)',
                                            color: ['pending', 'viewed'].includes(app.status) ? '#ef4444' : 'var(--text-muted)',
                                            fontSize: '0.85rem', transition: 'all 0.2s ease',
                                            cursor: ['pending', 'viewed'].includes(app.status) ? 'pointer' : 'not-allowed'
                                        }}>
                                        {withdrawMutation.isLoading && withdrawMutation.variables === app._id ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <><i className="bi bi-x-lg me-1"></i> {
                                                app.status === 'hired' ? 'Hired' :
                                                    app.status === 'employment-ended' ? 'Ended' :
                                                        app.status === 'rejected' ? 'Rejected' :
                                                            app.status === 'shortlisted' ? 'Shortlisted' :
                                                                'Withdraw'
                                            }</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                        components={{
                            Footer: () => isFetchingNextPage ? (
                                <div className="text-center py-3 text-muted">Loading more...</div>
                            ) : null
                        }}
                    />
                </div>
            )}
            {selectedApp && (
                <Suspense fallback={null}>
                    <ApplicationDetailModal
                        selectedApp={selectedApp}
                        onClose={() => setSelectedApp(null)}
                        getStatusBadge={getStatusBadge}
                    />
                </Suspense>
            )}
        </div>
    );
}
export default MyApplications;