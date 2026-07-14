import { Login, Register, ResetPassword, VerifyOTP } from "../components/auth";
import HomePage from "../pages/PublicPage/HomePage";
import ProfilePage from "../pages/PublicPage/ProfilePage";
import ListToy from "../pages/PublicPage/ListToy";
import ToyDetail from "../pages/PublicPage/ToyDetail";
import BookingsPage from "../pages/PublicPage/BookingsPage";
import AdminDashboard from "../pages/AdminPage/AdminDashboard";
// import ManageToys from "../pages/AdminPage/ManageToys";
// import ManageBookings from "../pages/AdminPage/ManageBookings";
// import ManageInspections from "../pages/AdminPage/ManageInspections";
import ManageUsers from "../pages/AdminPage/ManageUsers";
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

      {/* Auth */}
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

      {/* Admin/Employee Management - Người 2 đã thêm Dashboard & Users */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      {/* <Route path="/admin/toys" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <ManageToys />
        </ProtectedRoute>
      } /> */}
      {/* <Route path="/admin/bookings" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <ManageBookings />
        </ProtectedRoute>
      } /> */}
      {/* <Route path="/admin/inspections" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <ManageInspections />
        </ProtectedRoute>
      } /> */}
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ManageUsers />
        </ProtectedRoute>
      } />

      {/* Legacy redirects / Role entry points */}
      <Route path="/employee" element={
         <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <AdminDashboard />
         </ProtectedRoute>
      } />
    </Routes>
  );
}