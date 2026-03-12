"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import { useJobDetails, useApplications, useApplyForJob } from '@/hooks/queries/useApplications';
import { formatDate, formatSalary, timeAgo } from '@/utils/index';

const ApplyModal = dynamic(() => import('@/components/common/ApplyModal'), { ssr: false });

export default function JobDetailClient({ id }: { id: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const { data: job, isLoading: loading, isError } = useJobDetails(id);
    const { data: applications } = useApplications(!!user && user.role === 'worker');
    const applyMutation = useApplyForJob();

    const applied = useMemo(() => {
        if (!user || user.role !== 'worker' || !applications) return false;
        const allApps = applications.pages?.flatMap((p: any) => p.applications) || [];
        return allApps.some((app: any) => app.job?._id === id);
    }, [applications, user, id]);

    const handleApply = async (coverNote: string) => {
        if (!user) {
            router.push(`/login?redirect=/jobs/${id}`);
            return;
        }
        try {
            await applyMutation.mutateAsync({ jobId: id, data: { coverNote } });
            setShowApplyModal(false);
        } catch (err: any) {
            alert(err.response?.data?.error || err.response?.data?.message || 'Error applying for job');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ─── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
                <div className="container py-5">
                    {/* Hero skeleton */}
                    <div className="rounded-5 mb-5 overflow-hidden" style={{ height: '340px', background: 'var(--bg-card)', animation: 'pulse 2s infinite' }}>
                        <div className="w-100 h-100" style={{ background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-card) 50%, var(--bg-surface) 75%)', backgroundSize: '200% 100%' }}></div>
                    </div>
                    <div className="row g-5">
                        <div className="col-lg-8">
                            <div className="rounded-4 mb-3" style={{ height: 24, width: '60%', background: 'var(--bg-card)' }}></div>
                            <div className="rounded-4 mb-3" style={{ height: 16, width: '40%', background: 'var(--bg-surface)' }}></div>
                            <div className="rounded-4" style={{ height: 160, background: 'var(--bg-card)' }}></div>
                        </div>
                        <div className="col-lg-4">
                            <div className="rounded-5" style={{ height: 340, background: 'var(--bg-card)' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Error ───────────────────────────────────────────────────────────────────
    if (isError || !job) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
                <div className="text-center px-4">
                    <div className="mb-4 mx-auto rounded-5 d-flex align-items-center justify-content-center"
                        style={{ width: 96, height: 96, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <i className="bi bi-search fs-1" style={{ color: 'var(--text-muted)' }}></i>
                    </div>
                    <h3 className="fw-black mb-2" style={{ color: 'var(--text-main)' }}>This job isn't here</h3>
                    <p className="text-muted mb-4">It may have been removed or the link is broken.</p>
                    <Link href="/" className="btn px-5 py-3 rounded-pill fw-bold auth-submit-btn">← Back to Jobs</Link>
                </div>
            </div>
        );
    }

    const isActive = job.status === 'active';
    const canApply = user?.role !== 'employer';

    // ─── Main render ─────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>

            {/* ═══ HERO BANNER ══════════════════════════════════════════════════════ */}
            <div className="position-relative overflow-hidden" style={{
                height: '240px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 70%, #7c3aed 100%)',
            }}>
                {/* Radial glow overlays */}
                <div className="position-absolute w-100 h-100" style={{
                    inset: 0,
                    backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.3) 0%, transparent 50%)',
                }}></div>

                {/* Back nav */}
                <div className="container position-relative" style={{ zIndex: 2 }}>
                    <button
                        onClick={() => router.back()}
                        className="btn d-inline-flex align-items-center gap-2 mt-5 px-4 py-2 fw-semibold rounded-pill"
                        style={{
                            background: 'rgba(255,255,255,0.12)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            fontSize: '0.9rem',
                        }}
                    >
                        <i className="bi bi-arrow-left"></i> Back
                    </button>
                </div>
            </div>

            {/* ═══ IDENTITY ROW ═════════════════════════════════════════════════════ */}
            <div className="container" style={{ position: 'relative', zIndex: 5 }}>
                <div className="d-flex align-items-end gap-4 mb-5" style={{ marginTop: '-44px' }}>
                    {/* Logo */}
                    <div className="flex-shrink-0 rounded-4 overflow-hidden shadow-lg border border-3"
                        style={{
                            width: 96, height: 96,
                            borderColor: 'var(--bg-body)',
                            background: 'var(--bg-card)',
                            position: 'relative',
                        }}>
                        {job.company?.logo ? (
                            <Image src={job.company.logo} alt={job.company.name} fill sizes="96px" style={{ objectFit: 'cover' }} />
                        ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-black text-white"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '2rem' }}>
                                {job.title?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Title block */}
                    <div className="flex-grow-1 pb-1">
                        <h1 className="fw-black mb-1" style={{
                            color: 'var(--text-main)',
                            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                            letterSpacing: '-0.04em',
                            lineHeight: 1.1,
                        }}>
                            {job.title}
                        </h1>
                        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                            <span className="fw-bold fs-6" style={{ color: 'var(--primary-500)' }}>{job.company?.name}</span>
                            <span style={{ color: 'var(--border-color)' }}>·</span>
                            <span className="small" style={{ color: 'var(--text-muted)' }}>
                                <i className="bi bi-geo-alt me-1"></i>{job.city}, {job.state}
                            </span>
                            <span style={{ color: 'var(--border-color)' }}>·</span>
                            <span className="small" style={{ color: 'var(--text-muted)' }}>
                                <i className="bi bi-clock me-1"></i>{timeAgo(job.createdAt)}
                            </span>
                            {/* Job type badge sits here, inline with meta */}
                            <span className="badge rounded-pill fw-bold text-uppercase ms-1" style={{
                                background: 'var(--primary-50)',
                                color: 'var(--primary-600)',
                                fontSize: '0.62rem',
                                letterSpacing: '0.08em',
                                padding: '4px 10px',
                                border: '1px solid var(--primary-100)',
                            }}>
                                {job.jobType?.replace(/-/g, ' ') || 'Full-time'}
                            </span>
                            {!isActive && (
                                <span className="badge bg-warning text-dark rounded-pill px-3 py-1 fw-bold">{job.status}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ MAIN CONTENT ═════════════════════════════════════════════════════ */}
            <div className="container pb-5">
                <div className="row g-5">

                    {/* ── LEFT COL ──────────────────────────────────────────────────── */}
                    <div className="col-lg-8">

                        {/* Quick Stats Bar */}
                        <div className="rounded-4 p-1 mb-5 d-flex gap-1 flex-wrap" style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                        }}>
                            {[
                                { icon: 'bi-cash-coin', label: 'Salary', value: formatSalary(job.salaryMin, job.salaryMax, job.salaryType) },
                                { icon: 'bi-award', label: 'Experience', value: job.experienceMin > 0 ? `${job.experienceMin}+ yrs` : 'Fresher' },
                                { icon: 'bi-people', label: 'Vacancies', value: `${job.vacancies || 1} open` },
                                { icon: 'bi-sun', label: 'Shift', value: job.shift || 'Flexible' },
                            ].map((s, i) => (
                                <div key={i} className="flex-fill px-4 py-3 rounded-3 d-flex align-items-center gap-3" style={{ minWidth: 140, background: 'var(--bg-surface)' }}>
                                    <i className={`bi ${s.icon} fs-5`} style={{ color: 'var(--primary-500)' }}></i>
                                    <div>
                                        <div className="text-uppercase fw-black opacity-40" style={{ fontSize: '0.58rem', letterSpacing: '1.5px' }}>{s.label}</div>
                                        <div className="fw-bold" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{s.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <section className="mb-5">
                            <h3 className="fw-black mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.03em' }}>About the role</h3>
                            <div className="mb-4" style={{ width: 40, height: 3, background: 'var(--primary-500)', borderRadius: 99 }}></div>
                            <div style={{
                                color: 'var(--text-main)',
                                opacity: 0.82,
                                lineHeight: '1.85',
                                fontSize: '1.05rem',
                                whiteSpace: 'pre-line',
                            }}>
                                {job.description}
                            </div>
                        </section>

                        {/* Skills & Benefits side-by-side */}
                        {(job.skills?.length > 0 || job.benefits?.length > 0) && (
                            <div className="row g-4">
                                {job.skills?.length > 0 && (
                                    <div className={job.benefits?.length > 0 ? 'col-md-6' : 'col-12'}>
                                        <div className="p-4 rounded-4 h-100" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                            <h5 className="fw-black mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                                                <i className="bi bi-code-slash me-2" style={{ color: 'var(--primary-500)' }}></i>Skills Required
                                            </h5>
                                            <div className="mb-4" style={{ width: 32, height: 2, background: 'var(--primary-500)', borderRadius: 99 }}></div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {job.skills.map((skill: string, idx: number) => (
                                                    <span key={idx} className="fw-semibold px-3 py-2 rounded-pill"
                                                        style={{
                                                            background: 'var(--bg-surface)',
                                                            color: 'var(--text-main)',
                                                            border: '1.5px solid var(--border-color)',
                                                            fontSize: '0.85rem',
                                                        }}>
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {job.benefits?.length > 0 && (
                                    <div className={job.skills?.length > 0 ? 'col-md-6' : 'col-12'}>
                                        <div className="p-4 rounded-4 h-100" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                            <h5 className="fw-black mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                                                <i className="bi bi-gift me-2" style={{ color: '#10b981' }}></i>Perks & Benefits
                                            </h5>
                                            <div className="mb-4" style={{ width: 32, height: 2, background: '#10b981', borderRadius: 99 }}></div>
                                            <div className="d-flex flex-column gap-2">
                                                {job.benefits.map((b: string, idx: number) => (
                                                    <div key={idx} className="d-flex align-items-center gap-2">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                            style={{ width: 22, height: 22, background: 'rgba(16,185,129,0.12)' }}>
                                                            <i className="bi bi-check-lg" style={{ color: '#10b981', fontSize: '0.65rem' }}></i>
                                                        </div>
                                                        <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{b}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT SIDEBAR ──────────────────────────────────────────────── */}
                    <div className="col-lg-4">
                        <div className="position-sticky" style={{ top: '96px' }}>

                            {/* Apply card */}
                            <div className="rounded-5 overflow-hidden mb-4 shadow-lg" style={{ border: '1px solid var(--border-color)' }}>
                                {/* Card header */}
                                <div className="px-5 py-4" style={{
                                    background: applied
                                        ? 'linear-gradient(135deg, #064e3b, #065f46)'
                                        : isActive
                                            ? 'linear-gradient(135deg, #312e81, #4f46e5)'
                                            : 'linear-gradient(135deg, #374151, #4b5563)',
                                }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)' }}>
                                            <i className={`bi fs-4 text-white ${applied ? 'bi-check2-all' : isActive ? 'bi-rocket-takeoff' : 'bi-lock'}`}></i>
                                        </div>
                                        <div>
                                            <div className="fw-black text-white fs-6">
                                                {applied ? 'You applied!' : isActive ? 'Ready to apply?' : 'Applications closed'}
                                            </div>
                                            <div className="opacity-75 text-white" style={{ fontSize: '0.78rem' }}>
                                                {applied ? 'Your application is under review' : isActive ? 'Typically responds in 1-2 days' : `Status: ${job.status}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="px-5 py-4" style={{ background: 'var(--bg-card)' }}>
                                    {canApply && (
                                        <button
                                            onClick={() => user ? setShowApplyModal(true) : router.push(`/login?redirect=/jobs/${id}`)}
                                            disabled={applied || !isActive}
                                            className="btn w-100 py-3 rounded-pill fw-black mb-3"
                                            style={{
                                                fontSize: '1rem',
                                                letterSpacing: '-0.01em',
                                                background: applied ? 'var(--zinc-400)' : 'var(--zinc-900)',
                                                color: '#fff',
                                                border: 'none',
                                                opacity: applied || !isActive ? 0.65 : 1,
                                                transition: 'opacity 0.2s ease, transform 0.2s ease',
                                            }}>
                                            {applied ? (
                                                <><i className="bi bi-check2-circle me-2"></i>Already Applied</>
                                            ) : !isActive ? (
                                                <><i className="bi bi-lock me-2"></i>Closed</>
                                            ) : (
                                                <>Apply Now &nbsp;→</>
                                            )}
                                        </button>
                                    )}

                                    {user?.role === 'employer' && (
                                        <div className="rounded-4 p-3 mb-3 small" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                                            <i className="bi bi-info-circle me-2"></i>
                                            Switch to a worker account to apply.
                                        </div>
                                    )}

                                    <button
                                        onClick={handleShare}
                                        className="btn w-100 py-2 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-2"
                                        style={{
                                            background: 'var(--bg-surface)',
                                            color: 'var(--text-main)',
                                            border: '1px solid var(--border-color)',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.2s ease',
                                        }}>
                                        <i className={`bi ${copied ? 'bi-check2' : 'bi-link-45deg'} fs-5`}></i>
                                        {copied ? 'Link copied!' : 'Share this job'}
                                    </button>

                                    {/* Stats row */}
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="text-center flex-fill">
                                                <div className="fw-black fs-5" style={{ color: 'var(--text-main)' }}>{job.applicationsCount ?? '—'}</div>
                                                <div className="text-uppercase fw-bold opacity-40" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Applicants</div>
                                            </div>
                                            <div style={{ width: 1, height: 36, background: 'var(--border-color)' }}></div>
                                            <div className="text-center flex-fill">
                                                <div className="fw-black fs-5" style={{ color: 'var(--text-main)' }}>{job.vacancies || 1}</div>
                                                <div className="text-uppercase fw-bold opacity-40" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Vacancies</div>
                                            </div>
                                            <div style={{ width: 1, height: 36, background: 'var(--border-color)' }}></div>
                                            <div className="text-center flex-fill">
                                                <div className="fw-black fs-5" style={{ color: 'var(--text-main)' }}>{job.experienceMin ?? 0}+</div>
                                                <div className="text-uppercase fw-bold opacity-40" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Yrs Exp</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Company blurb card */}
                            {job.company?.name && (
                                <div className="rounded-5 p-4 mb-4 d-flex gap-3 align-items-center" style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                }}>
                                    <div className="flex-shrink-0 rounded-3 overflow-hidden" style={{ width: 48, height: 48, background: 'var(--bg-surface)', position: 'relative' }}>
                                        {job.company.logo
                                            ? <Image src={job.company.logo} alt={job.company.name} fill sizes="48px" style={{ objectFit: 'cover' }} />
                                            : <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-black text-white" style={{ background: 'var(--primary-500)' }}>{job.company.name.charAt(0)}</div>
                                        }
                                    </div>
                                    <div>
                                        <div className="fw-bold" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{job.company.name}</div>
                                        <div className="small" style={{ color: 'var(--text-muted)' }}>
                                            <i className="bi bi-geo-alt me-1"></i>{job.city}, {job.state}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Trust badge */}
                            <div className="rounded-4 p-4 d-flex gap-3 align-items-center" style={{
                                background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(139,92,246,0.08))',
                                border: '1px solid rgba(99,102,241,0.2)',
                            }}>
                                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{ width: 40, height: 40, background: 'rgba(99,102,241,0.15)' }}>
                                    <i className="bi bi-shield-fill-check" style={{ color: '#6366f1' }}></i>
                                </div>
                                <div>
                                    <div className="fw-bold small" style={{ color: 'var(--text-main)' }}>Verified Employer</div>
                                    <div className="opacity-60 small" style={{ color: 'var(--text-muted)' }}>This listing is reviewed by SkillAnchor</div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {showApplyModal && (
                <ApplyModal
                    show={showApplyModal}
                    onClose={() => setShowApplyModal(false)}
                    onApply={handleApply}
                    applying={applyMutation.isPending}
                />
            )}
        </div>
    );
}
