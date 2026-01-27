const Card = ({ job, isSelected, onClick }) => {
  return (
    <div
      className={`card mb-4 shadow-sm card-hover-effect ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderRadius: "16px",
        backgroundColor: isSelected ? "var(--bg-surface)" : "var(--bg-card)",

        border: isSelected ? "1px solid var(--border-active)" : "1px solid transparent",
        boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-sm)",
        
        transform: isSelected ? "scale(1.02)" : undefined
      }}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-3">
          <img
            src={job.company?.logo}
            className="rounded-4 object-cover"
            alt={job.title}
            style={{ width: "64px", height: "64px", flexShrink: 0, background: "var(--zinc-100)" }}
          />
          <div className="flex-grow-1 min-w-0">
            <h6 className="fw-bold mb-1 text-truncate" style={{ color: "var(--text-main)" }}>
              {job.title}
            </h6>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="small fw-medium text-truncate" style={{ color: "var(--text-muted)" }}>{job.company?.name}</span>
              <span className="small" style={{ color: "var(--text-muted)" }}>•</span>
              <span className="small fw-medium text-truncate" style={{ color: "var(--text-muted)" }}>{job.city}, {job.state}</span>
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-wallet2" style={{ color: "var(--text-muted)", fontSize: "1rem" }}></i>
                <span className="fw-bold text-gradient" style={{ fontSize: "0.95rem" }}>
                  ₹{job.salaryMin}-{job.salaryMax}
                </span>
              </div>
              <small style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(job.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
