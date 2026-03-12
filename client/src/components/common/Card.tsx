import { memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Job } from '@/types';

const logoStyle = { width: "56px", height: "56px", background: "var(--zinc-100)" };
const fallbackLogoBase = {
    width: "56px", height: "56px", flexShrink: 0,
    background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
    color: "white", fontSize: "1.25rem"
};

interface CardProps {
    job: Job;
    isSelected: boolean;
    onClick: () => void;
}

const Card = memo(({ job, isSelected, onClick }: CardProps) => {
    const cardStyle = {
        cursor: "pointer", borderRadius: "16px",
        backgroundColor: isSelected ? "var(--bg-surface)" : "var(--bg-card)",
        border: isSelected ? "1px solid var(--border-active)" : "1px solid transparent",
        boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-sm)",
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, scale: isSelected ? 1.02 : 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: isSelected ? 1.02 : 1.015, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`card shadow-sm ${isSelected ? "selected" : ""}`}
            onClick={onClick}
            style={{ ...cardStyle, willChange: "transform, opacity" }}
        >
            <div className="card-body p-3 p-sm-4 overflow-hidden w-100">
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 w-100" style={{ minWidth: 0 }}>
                    <div className="d-flex flex-shrink-0">
                        {job.company?.logo ? (
                            <div className="position-relative overflow-hidden rounded-4" style={logoStyle}>
                                <Image
                                    src={job.company.logo}
                                    alt={job.title}
                                    fill
                                    sizes="56px"
                                    style={{ objectFit: 'cover' }}
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <div
                                className="rounded-4 d-flex align-items-center justify-content-center fw-bold"
                                style={fallbackLogoBase}
                            >
                                {job.company?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                        )}
                    </div>

                    <div className="flex-grow-1 min-w-0 w-100" style={{ minWidth: 0 }}>
                        <h6 className="fw-bold mb-1 text-truncate w-100 d-block" style={{ color: "var(--text-main)" }}>
                            {job.title}
                        </h6>
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-2 w-100 overflow-hidden">
                            <span className="small fw-medium text-truncate" style={{ color: "var(--text-muted)", maxWidth: "150px", display: "inline-block" }}>{job.company?.name}</span>
                            <span className="small opacity-50 flex-shrink-0" style={{ color: "var(--text-muted)" }}> • </span>
                            <span className="small fw-medium text-truncate" style={{ color: "var(--text-muted)", maxWidth: "150px", display: "inline-block" }}>{job.city}, {job.state}</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2 min-w-0">
                                <i className="bi bi-wallet2 flex-shrink-0" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}></i>
                                <span className="fw-bold text-gradient text-truncate" style={{ fontSize: "0.9rem" }}>
                                    ₹{job.salaryMin?.toLocaleString()}{job.salaryMax ? `-${job.salaryMax.toLocaleString()}` : '+'}
                                </span>
                            </div>
                            <small className="flex-shrink-0" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                {new Date(job.createdAt).toLocaleDateString('en-GB')}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

Card.displayName = 'Card';

export default Card;
