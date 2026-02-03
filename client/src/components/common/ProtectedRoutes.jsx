import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    if (!user) {
        return <Navigate to="/login" replace></Navigate>
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace></Navigate>
    }
    return children;
}
export default ProtectedRoute;