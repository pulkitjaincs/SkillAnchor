export default function Loading() {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ minHeight: '60vh' }}>
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="fw-medium text-muted">Loading SkillAnchor...</p>
        </div>
    );
}
