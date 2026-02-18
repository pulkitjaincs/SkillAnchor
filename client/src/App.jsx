import Navbar from "./components/layout/Navbar";
import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/common/ProtectedRoutes";
import { AnimatePresence } from "framer-motion";
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));
const PostJobPage = lazy(() => import("./pages/PostJobPage"));
const MyJobsPage = lazy(() => import("./pages/MyJobsPage"));
const EditJobPage = lazy(() => import("./pages/EditJobPage"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const JobApplicantsPage = lazy(() => import("./pages/JobApplicantsPage"));
const WorkerProfilePage = lazy(() => import("./pages/WorkerProfilePage"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const HiredWorkersPage = lazy(() => import("./pages/HiredWorkersPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));


function App() {
  const location = useLocation();
  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: "var(--bg-body)" }}>
      <Navbar name="SkillAnchor" />
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="min-vh-100 d-flex align-items-center justify-content-center">Loading...</div>}>
          <Routes location={location} key={location.pathname}>
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
        </Suspense>

      </AnimatePresence>
    </div>
  );
}

export default App;
