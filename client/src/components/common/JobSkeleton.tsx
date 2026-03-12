import { memo } from 'react';
import { motion } from 'framer-motion';

const JobSkeleton = memo(() => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`card shadow-sm mb-3`}
            style={{ 
                borderRadius: "16px",
                backgroundColor: "var(--bg-card)",
                border: "1px solid transparent",
                overflow: 'hidden'
            }}
        >
            <div className="card-body p-3 p-sm-4">
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                    {/* Logo Skeleton */}
                    <div className="d-flex flex-shrink-0 placeholder-glow">
                        <div 
                            className="placeholder rounded-4" 
                            style={{ width: "56px", height: "56px", backgroundColor: "var(--bg-surface)" }} 
                        />
                    </div>

                    <div className="flex-grow-1 min-w-0 w-100 placeholder-glow">
                        {/* Title Skeleton */}
                        <div className="placeholder col-8 mb-2 rounded" style={{ height: "20px", backgroundColor: "var(--bg-surface)" }} />
                        
                        {/* Meta Info Skeleton */}
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="placeholder col-3 rounded" style={{ height: "14px", backgroundColor: "var(--bg-surface)" }} />
                            <span className="placeholder col-2 rounded" style={{ height: "14px", backgroundColor: "var(--bg-surface)" }} />
                        </div>

                        {/* Bottom Row Skeleton */}
                        <div className="d-flex align-items-center justify-content-between gap-2 mt-2">
                            <span className="placeholder col-4 rounded" style={{ height: "16px", backgroundColor: "var(--bg-surface)" }} />
                            <span className="placeholder col-2 rounded" style={{ height: "12px", backgroundColor: "var(--bg-surface)" }} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

JobSkeleton.displayName = 'JobSkeleton';

export default JobSkeleton;
