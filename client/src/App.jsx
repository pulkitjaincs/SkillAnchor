import Navbar from "./components/layout/Navbar";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobDetailPage from "./pages/JobDetailPage";
import ProtectedRoute from "./components/common/ProtectedRoutes";
import PostJobPage from "./pages/PostJobPage";
import MyJobsPage from "./pages/MyJobsPage";
import EditJobPage from "./pages/EditJobPage";
import MyApplications from "./pages/MyApplications";
import JobApplicantsPage from "./pages/JobApplicantsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import WorkerProfilePage from "./pages/WorkerProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import SettingsPage from './pages/SettingsPage';
import HiredWorkersPage from "./pages/HiredWorkersPage";

function App() {
  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: "var(--bg-body)", transition: "background-color 0.3s" }}>
      <Navbar name="KaamSetu" />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/post-job" element={<ProtectedRoute allowedRoles={['employer']}><PostJobPage /></ProtectedRoute>}></Route>
        <Route path="/my-jobs" element={<ProtectedRoute allowedRoles={['employer']}><MyJobsPage /></ProtectedRoute>}></Route>
        <Route path="/edit-job/:id" element={<ProtectedRoute allowedRoles={['employer']}><EditJobPage /></ProtectedRoute>}></Route>
        <Route path="/my-applications" element={<ProtectedRoute allowedRoles={['worker']}><MyApplications /></ProtectedRoute>}></Route>
        <Route path="/jobs/:jobId/applicants" element={<ProtectedRoute allowedRoles={['employer']}><JobApplicantsPage /></ProtectedRoute>}></Route>
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['worker', 'employer']}><WorkerProfilePage /></ProtectedRoute>}></Route>
        <Route path="/profile/:userId" element={<ProtectedRoute allowedRoles={['worker', 'employer']}><WorkerProfilePage /></ProtectedRoute>}></Route>
        <Route path="/profile/edit" element={<ProtectedRoute allowedRoles={['worker', 'employer']}><EditProfilePage /></ProtectedRoute>}></Route>
        <Route path="/profile/settings" element={<ProtectedRoute allowedRoles={['worker', 'employer']}><SettingsPage /></ProtectedRoute>} />
        <Route path="/my-team" element={<ProtectedRoute allowedRoles={['employer']}><HiredWorkersPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
