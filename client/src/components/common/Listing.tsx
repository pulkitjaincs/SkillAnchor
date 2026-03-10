"use client";

import { useState, useEffect, useCallback, Suspense, memo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useAuth } from '@/context/AuthContext';
import { applicationsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { formatDate, formatSalary, timeAgo } from "@/utils/index";
import type { Job } from '@/types';

const ApplyModal = dynamic(() => import("@/components/common/ApplyModal"), { ssr: false });

const listingCardBase = { borderRadius: "24px", background: "var(--bg-card)", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.15)" };
const bannerStyle = { height: "160px", background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))", borderRadius: "24px 24px 0 0" };
const closeBtnStyle = { width: "40px", height: "40px", background: "rgba(255,255,255,0.95)", border: "none", zIndex: 10 };
const xIconStyle = { fontSize: "1.2rem", color: "var(--text-main)" };
const logoImgStyle = { width: "100px", height: "100px", objectFit: "cover" as const };
const bodyStyle = { overflowY: "auto" as const, height: "calc(100% - 160px)" };

interface ListingProps {
    job: Job | null;
    onClose: () => void;
    isSwitch?: boolean;
}

const Listing = memo(({ job, onClose, isSwitch = false }: ListingProps) => {
    const router = useRouter();
    const { user } = useAuth();
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const checkIfApplied = async () => {
            if (!user || user.role !== 'worker' || !job) {
                setApplied(false);
                return;
            }
            if (user && user.role === 'worker') {
                try {
                    const res = await applicationsAPI.getMyApplications();
                    const hasApplied = res.data.some((app: any) => app.job._id === job._id);
                    setApplied(hasApplied);
                } catch (error) {
                    console.log('Error checking application status');
                }
            }
        };
        checkIfApplied();
    }, [job?._id, user]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 350);
    }, [onClose]);

    const handleApply = async (coverNote: string) => {
        if (!job) return;

        if (!user) {
            router.push(`/login?redirect=/?openJob=${job._id}`);
            return;
        }
        setApplying(true);
        try {
            await applicationsAPI.apply(job._id, { coverNote });
            setApplied(true);
            setShowApplyModal(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Error applying for job");
        } finally {
            setApplying(false);
        }
    }

    const getAnimationClass = () => {
        if (isClosing) return 'animate-exit-listing';
        if (isSwitch) return 'animate-switch-listing';
        return 'animate-entry-listing';
    };

    if (!job) {
        return (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                <div className="bg-white p-5 rounded-circle shadow-sm mb-4">
                    <i className="bi bi-briefcase fs-1 text-primary alert-primary p-4 rounded-circle"></i>
                </div>
                <h4 className="fw-bold text-secondary">Select a job to view details</h4>
            </div>
        );
    }

    return (
        <div key={job._id} className={`card h-100 border-0 custom-scroll overflow-hidden ${getAnimationClass()}`}
            style={listingCardBase}>
            <div className="position-relative" style={bannerStyle}>
                <button
                    onClick={handleClose}
                    className="position-absolute top-0 start-0 m-3 btn rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center hover-scale"
                    style={closeBtnStyle}
                    aria-label="Back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                <div className="position-absolute bottom-0 start-0 p-4 translate-y-50 d-flex align-items-end gap-3" style={{ transform: "translateY(40%)" }}>
                    {job.company?.logo && (
                        <div className="position-relative shadow-lg border border-4 border-white rounded-4 overflow-hidden" style={logoImgStyle}>
                            <Image
                                src={job.company.logo}
                                alt={job.company.name}
                                fill
                                sizes="100px"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="card-body px-4 px-md-5 pt-5 pb-4 custom-scroll" style={bodyStyle}>

                <div className="mt-2 mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div className="min-w-0 flex-grow-1">
                        <h2 className="fw-bold mb-1 fs-3" style={{ letterSpacing: "-0.03em", color: "var(--text-main)" }}>{job.title}</h2>
                        <h5 className="fw-medium mb-2 fs-6" style={{ color: "var(--text-muted)" }}>{job.company?.name}</h5>
                        <div className="d-flex align-items-center flex-wrap gap-x-3 gap-y-1 small" style={{ color: "var(--text-muted)" }}>
                            <span className="d-flex align-items-center gap-1 text-truncate"><i className="bi bi-geo-alt-fill text-primary"></i> {job.city}, {job.state}</span>
                            <span className="d-flex align-items-center gap-1"><i className="bi bi-clock-fill text-primary"></i> Posted {formatDate(job.createdAt)}</span>
                        </div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap mt-0 mt-sm-3">
                        <button
                            onClick={() => router.push(`/jobs/${job._id}`)}
                            className="btn px-4 py-2 fw-semibold rounded-pill"
                            style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                            <i className="bi bi-box-arrow-up-right me-2"></i>Full Details
                        </button>
                        {user?.role !== 'employer' && (
                            <button
                                onClick={() => user ?
                                    setShowApplyModal(true) :
                                    router.push(`/login?redirect=/?openJob=${job._id}`)}
                                disabled={applied}
                                className="btn px-4 py-2 fw-semibold rounded-pill"
                                style={{ background: applied ? '#22c55e' : 'var(--primary-500)', color: 'white' }}>
                                {applied ? (
                                    <><i className="bi bi-check-lg me-2"></i>Applied</>
                                ) : (
                                    <><i className="bi bi-send-fill me-2"></i>Apply Now</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="row g-3 mb-5">
                    {[
                        { label: "Salary", value: formatSalary(job.salaryMin, job.salaryMax, job.salaryType), icon: "bi-cash-stack" },
                        { label: "Job Type", value: job.jobType || "Full-time", icon: "bi-briefcase-fill" },
                        { label: "Experience", value: `${job.experienceMin || 0}+ Years`, icon: "bi-star-fill" },
                    ].map((stat, idx) => (
                        <div key={idx} className="col-md-4">
                            <div className="p-3 rounded-4 border" style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-2 rounded-3 shadow-sm" style={{ background: "var(--bg-card)", color: "var(--primary-600)" }}>
                                        <i className={`bi ${stat.icon} fs-5`}></i>
                                    </div>
                                    <div>
                                        <small className="d-block text-uppercase fw-bold" style={{ fontSize: "0.7rem", letterSpacing: "1px", color: "var(--text-muted)" }}>{stat.label}</small>
                                        <span className="fw-bold" style={{ color: "var(--text-main)" }}>{stat.value}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-5">
                    <h5 className="fw-bold mb-3 border-start border-4 border-primary ps-3" style={{ color: "var(--text-main)" }}>Job Description</h5>
                    <p style={{ lineHeight: "1.8", fontSize: "1.05rem", color: "var(--text-muted)" }}>
                        {job.description}
                    </p>

                </div>

                {job.skills && job.skills.length > 0 && (
                    <div className="mb-4">
                        <h5 className="fw-bold mb-3 border-start border-4 border-primary ps-3" style={{ color: "var(--text-main)" }}>Required Skills</h5>
                        <div className="d-flex gap-2 flex-wrap">
                            {job.skills.map((skill, index) => (
                                <span key={index} className="badge rounded-pill border px-3 py-2 fw-medium shadow-sm"
                                    style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

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
});

Listing.displayName = 'Listing';

export default Listing;
