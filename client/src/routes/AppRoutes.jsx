import { Routes, Route } from 'react-router-dom';
import App from '../App';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Unauthorized from '../pages/Unauthorized';
import CandidateProfile from '../pages/candidate/CandidateProfile';
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

      {/* Dashboard Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CandidateProfile />} />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="jobs" element={<App />} />
        <Route path="candidates" element={<App />} />
        <Route path="applications" element={<App />} />
        <Route path="interviews" element={<App />} />
        <Route path="analytics" element={<App />} />
        <Route path="settings" element={<CandidateProfile />} />
      </Route>

      {/* Candidate Profile Routes */}
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
    </Routes>
  );
};

export default AppRoutes;
