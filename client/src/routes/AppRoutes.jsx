import { Routes, Route } from 'react-router-dom';
import App from '../App';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Unauthorized from '../pages/Unauthorized';
import CandidateProfile from '../pages/candidate/CandidateProfile';

// Recruiter Pages
import RecruiterDashboard from '../pages/recruiter/RecruiterDashboard';
import RecruiterJobs from '../pages/recruiter/RecruiterJobs';
import RecruiterApplicants from '../pages/recruiter/RecruiterApplicants';
import RecruiterAnalytics from '../pages/recruiter/RecruiterAnalytics';
import RecruiterCompanies from '../pages/recruiter/RecruiterCompanies';

import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing & Auth Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/status" element={<App />} />

      {/* Main Dashboard Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RecruiterDashboard />} />
        <Route path="recruiter" element={<RecruiterDashboard />} />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="jobs" element={<RecruiterJobs />} />
        <Route path="candidates" element={<RecruiterApplicants />} />
        <Route path="applications" element={<RecruiterApplicants />} />
        <Route path="interviews" element={<RecruiterApplicants />} />
        <Route path="analytics" element={<RecruiterAnalytics />} />
        <Route path="companies" element={<RecruiterCompanies />} />
        <Route path="settings" element={<CandidateProfile />} />
      </Route>

      {/* Candidate Dedicated Profile Routes */}
      <Route
        path="/candidate/*"
        element={
          <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CandidateProfile />} />
        <Route path="profile" element={<CandidateProfile />} />
      </Route>

      {/* Recruiter Dedicated Routes */}
      <Route
        path="/recruiter/*"
        element={
          <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RecruiterDashboard />} />
        <Route path="jobs" element={<RecruiterJobs />} />
        <Route path="applicants" element={<RecruiterApplicants />} />
        <Route path="analytics" element={<RecruiterAnalytics />} />
        <Route path="companies" element={<RecruiterCompanies />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
