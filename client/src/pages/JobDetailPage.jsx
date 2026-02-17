import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lazy, Suspense } from 'react';
import { useJobDetails } from '../hooks/queries/useApplications';
import { useApplications, useApplyForJob } from '../hooks/queries/useApplications';
import { formatDate, formatSalary, timeAgo } from '../utils/index';

const ApplyModal = lazy(() => import('../components/common/ApplyModal'));

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { data: job, isLoading: loading, isError } = useJobDetails(id);
  const { data: applications = [] } = useApplications();
  const applyMutation = useApplyForJob();

  const applied = useMemo(() => {
    if (!user || user.role !== 'worker') return false;
    return applications.some(app => app.job?._id === id);
  }, [applications, user, id]);

  const handleApply = async (coverNote) => {
    if (!user) {
      navigate(`/login?redirect=/jobs/${id}`);
      return;
    }
    try {
      await applyMutation.mutateAsync({ jobId: id, data: { coverNote } });
      setShowApplyModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error applying for job');
    }
  };


  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3 d-block"></i>
        <h4 style={{ color: 'var(--text-main)' }}>Job not found</h4>
        <Link to="/" className="btn btn-outline-primary mt-3">← Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button onClick={() => navigate(-1)} className="btn text-decoration-none d-inline-flex align-items-center mb-4 p-0"
        style={{ color: 'var(--text-muted)', fontSize: '0.9rem', background: 'none', border: 'none' }}>
        ← Back
      </button>

      <div className="row">
        <div className="col-lg-8">
          <div className="p-4 p-md-5 mb-4" style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--border-color)'
          }}>
            <div className="d-flex flex-column flex-sm-row align-items-start gap-3 gap-md-4 mb-4">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={job.company.name}
                  className="rounded-4 shadow-sm flex-shrink-0"
                  style={{ width: '64px', height: '64px', objectFit: 'cover' }} />
              ) : (
                <div className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '64px', height: '64px',
                    background: 'var(--primary-500)', color: 'white',
                    fontSize: '1.5rem', fontWeight: 'bold'
                  }}>
                  {job.title?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-grow-1 min-w-0">
                <h1 className="fw-bold mb-1" style={{ color: 'var(--text-main)', fontSize: '1.5rem' }}>
                  {job.title}
                </h1>
                <p className="mb-2" style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                  {job.company?.name || 'Company'}
                </p>
                <div className="d-flex flex-wrap gap-2 gap-md-3" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span className="text-truncate"><i className="bi bi-geo-alt-fill me-1" style={{ color: 'var(--primary-500)' }}></i>{job.city}, {job.state}</span>
                  <span><i className="bi bi-clock me-1" style={{ color: 'var(--primary-500)' }}></i>Posted {formatDate(job.createdAt)}</span>
                  {job.status !== 'active' && (
                    <span className="badge bg-warning text-dark">{job.status}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              {[
                { label: 'Salary', value: formatSalary(job.salaryMin, job.salaryMax, job.salaryType), icon: 'bi-cash-stack' },
                { label: 'Job Type', value: job.jobType?.replace('-', ' '), icon: 'bi-briefcase-fill' },
                { label: 'Experience', value: job.experienceMin > 0 ? `${job.experienceMin}+ Years` : 'Fresher', icon: 'bi-star-fill' },
                { label: 'Shift', value: job.shift || 'Flexible', icon: 'bi-sun-fill' },
                { label: 'Vacancies', value: job.vacancies || 1, icon: 'bi-people-fill' },
              ].map((stat, idx) => (
                <div key={idx} className="col-6 col-md-4">
                  <div className="p-3 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${stat.icon}`} style={{ color: 'var(--primary-500)', fontSize: '1.1rem' }}></i>
                      <div>
                        <small className="d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{stat.label}</small>
                        <span className="fw-semibold" style={{ color: 'var(--text-main)', fontSize: '0.9rem', textTransform: 'capitalize' }}>{stat.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-main)' }}>
                <span className="me-2" style={{ width: '4px', height: '20px', background: 'var(--primary-500)', borderRadius: '2px' }}></span>
                Job Description
              </h5>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                {job.description}
              </p>
            </div>

            {job.skills?.length > 0 && (
              <div className="mb-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-main)' }}>
                  <span className="me-2" style={{ width: '4px', height: '20px', background: 'var(--primary-500)', borderRadius: '2px' }}></span>
                  Required Skills
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="badge rounded-pill px-3 py-2"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.benefits?.length > 0 && (
              <div className="mb-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: 'var(--text-main)' }}>
                  <span className="me-2" style={{ width: '4px', height: '20px', background: 'var(--primary-500)', borderRadius: '2px' }}></span>
                  Benefits
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {job.benefits.map((benefit, idx) => (
                    <span key={idx} className="badge rounded-pill px-3 py-2"
                      style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                      <i className="bi bi-check-circle-fill me-1"></i>{benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="p-4 position-sticky" style={{
            top: '100px',
            background: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--border-color)'
          }}>
            <h5 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Apply for this job</h5>

            {user?.role !== 'employer' && (
              <button
                onClick={() => user ? setShowApplyModal(true) : navigate(`/login?redirect=/jobs/${id}`)}
                disabled={applied || job.status !== 'active'}
                className="btn w-100 py-3 fw-bold rounded-pill mb-3"
                style={{
                  background: applied ? '#22c55e' : 'var(--primary-500)',
                  color: 'white',
                  border: 'none'
                }}>
                {applied ? (
                  <><i className="bi bi-check-lg me-2"></i>Applied</>
                ) : job.status !== 'active' ? (
                  <><i className="bi bi-pause-circle me-2"></i>Job {job.status}</>
                ) : (
                  <><i className="bi bi-send-fill me-2"></i>Apply Now</>
                )}
              </button>
            )}

            {user?.role === 'employer' && (
              <p className="text-center" style={{ color: 'var(--text-muted)' }}>
                <i className="bi bi-info-circle me-2"></i>Employers cannot apply to jobs
              </p>
            )}

            <button onClick={handleShare}
              className="btn w-100 py-2 rounded-pill"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
              <i className="bi bi-share me-2"></i>Share Job
            </button>

            <hr style={{ borderColor: 'var(--border-color)' }} />

            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <p className="mb-2"><i className="bi bi-people me-2"></i>{job.applicationsCount || 0} applicants</p>
              <p className="mb-0"><i className="bi bi-calendar3 me-2"></i>Posted {timeAgo(job.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <Suspense fallback={null}>
          <ApplyModal
            show={showApplyModal}
            onClose={() => setShowApplyModal(false)}
            onApply={handleApply}
            applying={applying}
          />
        </Suspense>
      )}
    </div>
  );
}

export default JobDetailPage;