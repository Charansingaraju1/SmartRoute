import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/Toaster';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Layout } from '@/layouts/Layout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { StudentLayout } from '@/layouts/StudentLayout';
import { TeacherLayout } from '@/layouts/TeacherLayout';

// Pages
import { HomePage } from '@/pages/HomePage';
import { BusInfoPage } from '@/pages/BusInfoPage';
import { RoutesPage } from '@/pages/RoutesPage';
import { TimingsPage } from '@/pages/TimingsPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { StudentRegisterPage } from '@/pages/auth/StudentRegisterPage';
import { TeacherRegisterPage } from '@/pages/auth/TeacherRegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyOTPPage } from '@/pages/auth/VerifyOTPPage';

// Student Pages
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage';
import { StudentMyBusPage } from '@/pages/student/StudentMyBusPage';
import { StudentMyRoutePage } from '@/pages/student/StudentMyRoutePage';
import { StudentBoardingPointPage } from '@/pages/student/StudentBoardingPointPage';
import { StudentNotificationsPage } from '@/pages/student/StudentNotificationsPage';
import { StudentMissedBusPage } from '@/pages/student/StudentMissedBusPage';
import { StudentSOSPage } from '@/pages/student/StudentSOSPage';
import { StudentBusPassPage } from '@/pages/student/StudentBusPassPage';
import { StudentGPSPage } from '@/pages/student/StudentGPSPage';
import { StudentPaymentsPage } from '@/pages/student/StudentPaymentsPage';
import { StudentProfilePage } from '@/pages/student/StudentProfilePage';
import { StudentSettingsPage } from '@/pages/student/StudentSettingsPage';

// Teacher Pages
import { TeacherDashboardPage } from '@/pages/teacher/TeacherDashboardPage';
import { TeacherBusesPage } from '@/pages/teacher/TeacherBusesPage';
import { TeacherRoutesPage } from '@/pages/teacher/TeacherRoutesPage';
import { TeacherPassengersPage } from '@/pages/teacher/TeacherPassengersPage';
import { TeacherAssignmentsPage } from '@/pages/teacher/TeacherAssignmentsPage';
import { TeacherMissedBusPage } from '@/pages/teacher/TeacherMissedBusPage';
import { TeacherDelaysPage } from '@/pages/teacher/TeacherDelaysPage';
import { TeacherDisruptionsPage } from '@/pages/teacher/TeacherDisruptionsPage';
import { TeacherSOSPage } from '@/pages/teacher/TeacherSOSPage';
import { TeacherTransportOpsPage } from '@/pages/teacher/TeacherTransportOpsPage';
import { TeacherLocationPage } from '@/pages/teacher/TeacherLocationPage';
import { TeacherNotificationsPage } from '@/pages/teacher/TeacherNotificationsPage';
import { TeacherProfilePage } from '@/pages/teacher/TeacherProfilePage';
import { TeacherSettingsPage } from '@/pages/teacher/TeacherSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: ('STUDENT' | 'TEACHER')[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse-subtle flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500/20">
          <svg className="h-6 w-6 text-terracotta-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/buses" element={<BusInfoPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/timings" element={<TimingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/student" element={<StudentRegisterPage />} />
        <Route path="/register/teacher" element={<TeacherRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
      </Route>

      {/* Student Routes */}
      <Route element={<StudentLayout />}>
        <Route
          path="/student/*"
          element={
            <PrivateRoute allowedRoles={['STUDENT']}>
              <Routes>
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="my-bus" element={<StudentMyBusPage />} />
                <Route path="my-route" element={<StudentMyRoutePage />} />
                <Route path="boarding-point" element={<StudentBoardingPointPage />} />
                <Route path="notifications" element={<StudentNotificationsPage />} />
                <Route path="missed-bus" element={<StudentMissedBusPage />} />
                <Route path="sos" element={<StudentSOSPage />} />
                <Route path="bus-pass" element={<StudentBusPassPage />} />
                <Route path="gps" element={<StudentGPSPage />} />
                <Route path="payments" element={<StudentPaymentsPage />} />
                <Route path="profile" element={<StudentProfilePage />} />
                <Route path="settings" element={<StudentSettingsPage />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </PrivateRoute>
          }
        />
      </Route>

      {/* Teacher Routes */}
      <Route element={<TeacherLayout />}>
        <Route
          path="/teacher/*"
          element={
            <PrivateRoute allowedRoles={['TEACHER']}>
              <Routes>
                <Route path="dashboard" element={<TeacherDashboardPage />} />
                <Route path="buses" element={<TeacherBusesPage />} />
                <Route path="routes" element={<TeacherRoutesPage />} />
                <Route path="passengers" element={<TeacherPassengersPage />} />
                <Route path="assignments" element={<TeacherAssignmentsPage />} />
                <Route path="missed-bus" element={<TeacherMissedBusPage />} />
                <Route path="delays" element={<TeacherDelaysPage />} />
                <Route path="disruptions" element={<TeacherDisruptionsPage />} />
                <Route path="sos" element={<TeacherSOSPage />} />
                <Route path="transport-ops" element={<TeacherTransportOpsPage />} />
                <Route path="location" element={<TeacherLocationPage />} />
                <Route path="notifications" element={<TeacherNotificationsPage />} />
                <Route path="profile" element={<TeacherProfilePage />} />
                <Route path="settings" element={<TeacherSettingsPage />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </PrivateRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-stone-50">
          <AppRoutes />
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;