import { memo } from 'react';

const logoStyle = { width: "56px", height: "56px", background: "var(--zinc-100)" };
const fallbackLogoBase = {
  width: "56px", height: "56px", flexShrink: 0,
  background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
  color: "white", fontSize: "1.25rem"
};

const Card = memo(({ job, isSelected, onClick }) => {
  const cardStyle = {
    cursor: "pointer", borderRadius: "16px",
    backgroundColor: isSelected ? "var(--bg-surface)" : "var(--bg-card)",
    border: isSelected ? "1px solid var(--border-active)" : "1px solid transparent",
    boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-sm)",
    transform: isSelected ? "scale(1.02)" : undefined
  };
  return (
    <div
      className={`card shadow-sm card-hover-effect ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      style={cardStyle}
    >
      <div className="card-body p-3 p-sm-4">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
          <div className="d-flex flex-shrink-0">
            {job.company?.logo ? (
              <img
                src={job.company.logo}
                className="rounded-4 object-cover"
                alt={job.title}
                loading="lazy"
                style={logoStyle}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className="rounded-4 d-flex align-items-center justify-content-center fw-bold"
              style={{ ...fallbackLogoBase, display: job.company?.logo ? "none" : "flex" }}
            >
              {job.company?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </div>

          <div className="flex-grow-1 min-w-0 w-100">
            <h6 className="fw-bold mb-1 text-truncate" style={{ color: "var(--text-main)" }}>
              {job.title}
            </h6>
            <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
              <span className="small fw-medium text-truncate max-w-150" style={{ color: "var(--text-muted)" }}>{job.company?.name}</span>
              <span className="small opacity-50" style={{ color: "var(--text-muted)" }}> • </span>
              <span className="small fw-medium text-truncate" style={{ color: "var(--text-muted)" }}>{job.city}, {job.state}</span>
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-wallet2" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}></i>
                <span className="fw-bold text-gradient" style={{ fontSize: "0.9rem" }}>
                  ₹{job.salaryMin?.toLocaleString()}{job.salaryMax ? `-${job.salaryMax.toLocaleString()}` : '+'}
                </span>
              </div>
              <small className="flex-shrink-0" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{new Date(job.createdAt).toLocaleDateString('en-GB')}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Card;
