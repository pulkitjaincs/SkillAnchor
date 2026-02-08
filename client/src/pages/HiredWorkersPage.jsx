import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function HiredWorkersPage() {
    const [team, setTeam] = useState([]);
    const { token } = useAuth();

    useEffect(() => {
        axios.get('/api/profile/my-team', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setTeam(res.data));
    }, [token]);

    const endEmployment = async (id) => {
        if (!window.confirm("Are you sure you want to end this worker's employment?")) return;
        try {
            await axios.patch(`/api/work-experience/${id}/end`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setTeam(team.filter(m => m._id !== id));
        } catch (err) {
            alert("Failed to end employment");
        }
    };

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4">My Team</h2>
            <div className="row g-4">
                {team.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3 text-muted">No hired workers active right now.</p>
                    </div>
                ) : (
                    team.map(member => (
                        <div className="col-md-4" key={member._id}>
                            <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
                                <img src={member.worker?.avatar || '/default-avatar.png'} className="rounded-circle mx-auto mb-3" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                <h5 className="fw-bold">{member.worker?.name || 'Unknown'}</h5>
                                <p className="text-muted small mb-3">{member.role}</p>
                                <div className="d-flex gap-2">
                                    <a href={`tel:${member.worker?.phone}`} className="btn btn-primary rounded-pill flex-grow-1">
                                        <i className="bi bi-telephone-fill me-2"></i> Call
                                    </a>
                                    <button onClick={() => endEmployment(member._id)} className="btn btn-outline-danger rounded-pill">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default HiredWorkersPage;