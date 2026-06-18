import { Login, Register, ResetPassword, VerifyOTP } from "../components/auth";
import HomePage from "../pages/PublicPage/HomePage";
import ProfilePage from "../pages/PublicPage/ProfilePage";
import ListToy from "../pages/PublicPage/ListToy";
import ToyDetail from "../pages/PublicPage/ToyDetail";
import BookingsPage from "../pages/PublicPage/BookingsPage";

// === Người 2: Admin Layout, Dashboard, ManageUsers ===
import AdminDashboard from "../pages/AdminPage/AdminDashboard";
import ManageUsers from "../pages/AdminPage/ManageUsers";
// import AdminSystemPage from "../pages/AdminPage/AdminSystemPage";
// import EmployeeDashboard from "../pages/AdminPage/EmployeeDashboard";

// === Người 3: ManageToys, ManageBookings, ManageInspections ===
import ManageToys from "../pages/AdminPage/ManageToys";
import ManageBookings from "../pages/AdminPage/ManageBookings";
import ManageInspections from "../pages/AdminPage/ManageInspections";

import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AppRoutes() {
  const navigate = useNavigate();
  return (
    <AuthProvider>
      <AppRoutesInternal navigate={navigate} />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

function AppRoutesInternal({ navigate }) {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/toys" element={<ListToy />} />
      <Route path="/toys/:id" element={<ToyDetail />} />
      <Route path="/bookings" element={
        <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'EMPLOYEE']}>
          <BookingsPage />
        </ProtectedRoute>
      } />
      <Route path="/payment-callback" element={
        <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'EMPLOYEE']}>
          <BookingsPage />
        </ProtectedRoute>
      } />

      {/* User */}
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'EMPLOYEE']}>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Auth - Người 1 */}
      <Route
        path="/login"
        element={
          <Login
            onNavigateToRegister={() => navigate('/register')}
            onNavigateToReset={() => navigate('/reset-password')}
          />
        }
      />
      <Route
        path="/register"
        element={
          <Register
            onNavigateToLogin={() => navigate('/login')}
          />
        }
      />
      <Route
        path="/reset-password"
        element={
          <ResetPassword
            onNavigateToLogin={() => navigate('/login')}
            onNavigateToOTP={(email) => navigate('/verify-otp', { state: { email } })}
          />
        }
      />
      <Route
        path="/verify-otp"
        element={
          <VerifyOTP
            onNavigateToLogin={() => navigate('/login')}
          />
        }
      />

      {/* Admin/Employee Management - Người 2 + Người 3 */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ManageUsers />
        </ProtectedRoute>
      } />

      {/* Người 3: Quản lý nghiệp vụ lõi */}
      <Route path="/admin/toys" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <ManageToys />
        </ProtectedRoute>
      } />
      <Route path="/admin/bookings" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <ManageBookings />
        </ProtectedRoute>
      } />
      <Route path="/admin/inspections" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <ManageInspections />
        </ProtectedRoute>
      } />

      {/* Legacy redirects */}
      <Route path="/employee" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}