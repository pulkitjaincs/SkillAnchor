import { useState } from "react";

const Listing = ({ job, onClose, isSwitch = false }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 350); // Match exit animation duration
  };

  // Determine animation class
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
    <div key={job.id} className={`card h-100 border-0 custom-scroll overflow-hidden ${getAnimationClass()}`}
      style={{
        borderRadius: "24px",
        background: "var(--bg-card)",
        color: "var(--text-main)"
      }}>
      {/* Hero Header */}
      <div className="position-relative" style={{ height: "160px", background: "linear-gradient(135deg, var(--primary-100), var(--zinc-100))" }}>
        {/* Close Button - Acts as Back on Mobile */}
        <button
          onClick={handleClose}
          className="position-absolute top-0 start-0 m-3 btn rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center hover-scale"
          style={{
            width: "40px",
            height: "40px",
            zIndex: 10,
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            color: "var(--text-main)"
          }}
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div className="position-absolute bottom-0 start-0 p-4 translate-y-50 d-flex align-items-end gap-3" style={{ transform: "translateY(40%)" }}>
          <img
            src={job.image}
            alt={job.company}
            className="rounded-4 shadow-lg border border-4 border-white"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        </div>
      </div>

      <div className="card-body px-4 px-md-5 pt-5 pb-4 custom-scroll" style={{ overflowY: "auto", height: "calc(100% - 160px)" }}>

        <div className="mt-2 mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1 display-6" style={{ letterSpacing: "-0.03em", color: "var(--text-main)" }}>{job.title}</h2>
            <h5 className="fw-medium mb-2" style={{ color: "var(--text-muted)" }}>{job.company}</h5>
            <div className="d-flex align-items-center gap-3 small" style={{ color: "var(--text-muted)" }}>
              <span className="d-flex align-items-center gap-1"><i className="bi bi-geo-alt-fill text-primary"></i> {job.location}</span>
              <span className="d-flex align-items-center gap-1"><i className="bi bi-clock-fill text-primary"></i> Posted 2 days ago</span>
            </div>
          </div>
          <button className="btn btn-premium px-5 py-3 rounded-4 fw-bold shadow-lg text-uppercase tracking-wider">
            Apply Now
          </button>
        </div>

        <div className="row g-3 mb-5">
          {[
            { label: "Salary", value: `₹${job.salary}`, icon: "bi-cash-stack" },
            { label: "Job Type", value: job.tags[0], icon: "bi-briefcase-fill" },
            { label: "Experience", value: "1 - 3 Years", icon: "bi-star-fill" },
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
          <div className="mt-3 p-4 rounded-4" style={{ whiteSpace: "pre-line", lineHeight: "1.8", background: "var(--bg-surface)", color: "var(--text-muted)" }}>
            {job.longDescription}
          </div>
        </div>

        <div className="mb-4">
          <h5 className="fw-bold mb-3 border-start border-4 border-primary ps-3" style={{ color: "var(--text-main)" }}>Required Skills</h5>
          <div className="d-flex gap-2 flex-wrap">
            {job.tags.map((tag, index) => (
              <span key={index} className="badge rounded-pill border px-3 py-2 fw-medium shadow-sm"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Listing;