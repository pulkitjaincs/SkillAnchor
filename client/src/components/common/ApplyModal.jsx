import { useState } from 'react'

function ApplyModal({ show, onClose, onApply, applying }) {
    const [coverNote, setCoverNote] = useState("");
    if (!show) {
        return null;
    }
    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-bold" style={{ color: 'var(--text-main)' }}>
                            <i className="bi bi-send-fill me-2" style={{ color: 'var(--primary-500)' }}></i>
                            Apply for this Job
                        </h5>
                        <button onClick={onClose} className="btn-close"></button>
                    </div>
                    <div className="modal-body">
                        <label className="form-label" style={{ color: 'var(--text-main)' }}>
                            Cover Note (Optional)
                        </label>
                        <textarea
                            value={coverNote}
                            onChange={(e) => setCoverNote(e.target.value)}
                            className="form-control premium-input"
                            rows={4}
                            placeholder="Introduce yourself briefly..."
                            maxLength={500}
                        />
                        <small style={{ color: 'var(--text-muted)' }}>{coverNote.length}/500</small>
                    </div>
                    <div className="modal-footer border-0">
                        <button onClick={onClose} className="btn rounded-pill px-4"
                            style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                            Cancel
                        </button>
                        <button onClick={() => onApply(coverNote)} disabled={applying}
                            className="btn rounded-pill px-4"
                            style={{ background: 'var(--primary-500)', color: 'white' }}>
                            {applying ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyModal;