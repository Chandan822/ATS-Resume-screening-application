import { Routes, Route } from 'react-router-dom';
import App from '../App';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Unauthorized from '../pages/Unauthorized';

// Candidate Pages
import CandidateProfile from '../pages/candidate/CandidateProfile';
import CandidateJobBoard from '../pages/candidate/CandidateJobBoard';
import CandidateApplications from '../pages/candidate/CandidateApplications';
import CandidateSavedJobs from '../pages/candidate/CandidateSavedJobs';

// Recruiter Pages
import RecruiterDashboard from '../pages/recruiter/RecruiterDashboard';
import RecruiterJobs from '../pages/recruiter/RecruiterJobs';
import RecruiterApplicants from '../pages/recruiter/RecruiterApplicants';
import RecruiterAnalytics from '../pages/recruiter/RecruiterAnalytics';
import RecruiterCompanies from '../pages/recruiter/RecruiterCompanies';
import RecruiterCandidates from '../pages/recruiter/RecruiterCandidates';
import RecruiterInterviews from '../pages/recruiter/RecruiterInterviews';
import RecruiterProfile from '../pages/recruiter/RecruiterProfile';



import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

function DashboardIndexRedirect() {
  const { user } = useAuth();
  if (user?.role === 'RECRUITER' || user?.role === 'ADMIN') {
    return <RecruiterDashboard />;
  }
  return <CandidateJobBoard />;
}

function DashboardJobsRoute() {
  const { user } = useAuth();
  if (user?.role === 'RECRUITER' || user?.role === 'ADMIN') {
    return <RecruiterJobs />;
  }
  return <CandidateJobBoard />;
}

function DashboardApplicationsRoute() {
  const { user } = useAuth();
  if (user?.role === 'RECRUITER' || user?.role === 'ADMIN') {
    return <RecruiterApplicants />;
  }
  return <CandidateApplications />;
}

function DashboardSettingsRoute() {
  const { user } = useAuth();
  if (user?.role === 'RECRUITER' || user?.role === 'ADMIN') {
    return <RecruiterProfile />;
  }
  return <CandidateProfile />;
}


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
        <Route index element={<DashboardIndexRedirect />} />
        <Route
          path="recruiter"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="jobs" element={<DashboardJobsRoute />} />
        <Route
          path="candidates"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
              <RecruiterCandidates />
            </ProtectedRoute>
          }
        />
        <Route path="applications" element={<DashboardApplicationsRoute />} />
        <Route
          path="saved-jobs"
          element={
            <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
              <CandidateSavedJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="interviews"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
              <RecruiterInterviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
              <RecruiterAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="companies"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
              <RecruiterCompanies />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<DashboardSettingsRoute />} />
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
        <Route index element={<CandidateJobBoard />} />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="jobs" element={<CandidateJobBoard />} />
        <Route path="applications" element={<CandidateApplications />} />
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
        <Route path="candidates" element={<RecruiterCandidates />} />
        <Route path="interviews" element={<RecruiterInterviews />} />
        <Route path="analytics" element={<RecruiterAnalytics />} />
        <Route path="companies" element={<RecruiterCompanies />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
