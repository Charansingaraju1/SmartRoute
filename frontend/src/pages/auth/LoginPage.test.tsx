// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';

// Mock AuthContext
const mockLogin = vi.fn();
const mockLoginWithGoogle = vi.fn();
vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    loginWithGoogle: mockLoginWithGoogle,
    user: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}));

// Mock useToast
const mockAddToast = vi.fn();
vi.mock('@/components/ui/Toaster', () => ({
  useToast: () => ({
    addToast: mockAddToast,
    toasts: [],
    removeToast: vi.fn(),
  }),
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (initialEntries = ['/login']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student/dashboard" element={<div data-testid="student-dashboard">Student Dashboard</div>} />
          <Route path="/teacher/dashboard" element={<div data-testid="teacher-dashboard">Teacher Dashboard</div>} />
          <Route path="/teacher/delays" element={<div data-testid="teacher-delays">Teacher Delays</div>} />
          <Route path="/register/student" element={<div data-testid="register-student">Student Registration</div>} />
          <Route path="/register/teacher" element={<div data-testid="register-teacher">Teacher Registration</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders login form elements and SSO buttons clearly labeled as unconfigured', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/student@anuraguniversity\.edu\.in/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in as student/i })).toBeInTheDocument();

    // Google and GitHub buttons
    const googleBtn = screen.getByRole('button', { name: /google/i });
    expect(googleBtn).toBeInTheDocument();
    expect(screen.getByText(/single sign-on \(google \/ github\) is unconfigured/i)).toBeInTheDocument();
  });

  it('toggles password visibility between password and text input types', async () => {
    renderComponent();
    const user = userEvent.setup();

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    expect(toggleBtn).toBeInTheDocument();

    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });

  it('switches role selector tabs between Student and Teacher, updating labels and placeholders', async () => {
    renderComponent();
    const user = userEvent.setup();

    const studentTab = screen.getByRole('tab', { name: /student/i });
    const teacherTab = screen.getByRole('tab', { name: /teacher/i });

    expect(studentTab).toHaveAttribute('aria-selected', 'true');
    expect(teacherTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByPlaceholderText(/student@anuraguniversity\.edu\.in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in as student/i })).toBeInTheDocument();

    // Switch to Teacher
    await user.click(teacherTab);

    expect(studentTab).toHaveAttribute('aria-selected', 'false');
    expect(teacherTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText(/teacher@anuraguniversity\.edu\.in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in as teacher/i })).toBeInTheDocument();
  });

  it('initializes with Teacher role when query param is ?role=teacher', () => {
    renderComponent(['/login?role=teacher']);

    const teacherTab = screen.getByRole('tab', { name: /teacher/i });
    expect(teacherTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText(/teacher@anuraguniversity\.edu\.in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in as teacher/i })).toBeInTheDocument();
  });

  it('provides signup links that reflect the currently selected role', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Default is student
    const studentSignupLink = screen.getByRole('link', { name: /sign up as student/i });
    expect(studentSignupLink).toHaveAttribute('href', '/register/student');

    // Switch to teacher
    await user.click(screen.getByRole('tab', { name: /teacher/i }));
    const teacherSignupLink = screen.getByRole('link', { name: /sign up as teacher/i });
    expect(teacherSignupLink).toHaveAttribute('href', '/register/teacher');
  });

  it('renders Google sign-in as disabled with explanatory guidance when unconfigured', () => {
    renderComponent();

    const googleBtn = screen.getByRole('button', { name: /google/i });
    expect(googleBtn).toBeDisabled();
    expect(googleBtn).toHaveAttribute('aria-disabled', 'true');
    expect(googleBtn).toHaveAttribute('title', expect.stringContaining('VITE_GOOGLE_CLIENT_ID'));
    expect(screen.getByText(/Google requires VITE_GOOGLE_CLIENT_ID/i)).toBeInTheDocument();
  });

  it('clicking GitHub sign-in triggers advisory toast', async () => {
    renderComponent();
    const user = userEvent.setup();

    const githubBtn = screen.getByRole('button', { name: /github/i });
    await user.click(githubBtn);

    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'info',
        title: 'GitHub Sign-In Unavailable',
      })
    );
  });

  it('shows error toast when credentials are invalid', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid email or password' } },
    });

    renderComponent();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/student@anuraguniversity\.edu\.in/i), 'wrong@anuraguniversity.edu.in');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'WrongPassword123');
    await user.click(screen.getByRole('button', { name: /sign in as student/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('wrong@anuraguniversity.edu.in', 'WrongPassword123', 'STUDENT');
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Sign in failed',
          message: 'Invalid email or password',
        })
      );
    });
  });

  it('rejects Teacher credentials submitted through Student Login and does not redirect', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'This account is registered as a Teacher. Please use Teacher Login.' } },
    });

    renderComponent();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/student@anuraguniversity\.edu\.in/i), 'teacher@anuraguniversity.edu.in');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'ValidTeacherPass123');
    await user.click(screen.getByRole('button', { name: /sign in as student/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('teacher@anuraguniversity.edu.in', 'ValidTeacherPass123', 'STUDENT');
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Sign in failed',
          message: 'This account is registered as a Teacher. Please use Teacher Login.',
        })
      );
      expect(screen.queryByTestId('student-dashboard')).not.toBeInTheDocument();
      expect(screen.queryByTestId('teacher-dashboard')).not.toBeInTheDocument();
    });
  });

  it('rejects Student credentials submitted through Teacher Login and does not redirect', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'This account is registered as a Student. Please use Student Login.' } },
    });

    renderComponent(['/login?role=teacher']);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/teacher@anuraguniversity\.edu\.in/i), 'student@anuraguniversity.edu.in');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'ValidStudentPass123');
    await user.click(screen.getByRole('button', { name: /sign in as teacher/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('student@anuraguniversity.edu.in', 'ValidStudentPass123', 'TEACHER');
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Sign in failed',
          message: 'This account is registered as a Student. Please use Student Login.',
        })
      );
      expect(screen.queryByTestId('student-dashboard')).not.toBeInTheDocument();
      expect(screen.queryByTestId('teacher-dashboard')).not.toBeInTheDocument();
    });
  });

  it('redirects student to /student/dashboard upon successful student login', async () => {
    mockLogin.mockResolvedValueOnce({
      id: 'student-1',
      name: 'Test Student',
      email: 'student@anuraguniversity.edu.in',
      role: 'STUDENT',
      active: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    });

    renderComponent();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/student@anuraguniversity\.edu\.in/i), 'student@anuraguniversity.edu.in');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'ValidPassword123');
    await user.click(screen.getByRole('button', { name: /sign in as student/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('student@anuraguniversity.edu.in', 'ValidPassword123', 'STUDENT');
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Welcome back!',
        })
      );
      expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
    });
  });

  it('redirects teacher to /teacher/dashboard upon successful teacher login', async () => {
    mockLogin.mockResolvedValueOnce({
      id: 'teacher-1',
      name: 'Test Teacher',
      email: 'teacher@anuraguniversity.edu.in',
      role: 'TEACHER',
      active: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    });

    renderComponent(['/login?role=teacher']);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/teacher@anuraguniversity\.edu\.in/i), 'teacher@anuraguniversity.edu.in');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'ValidPassword123');
    await user.click(screen.getByRole('button', { name: /sign in as teacher/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('teacher@anuraguniversity.edu.in', 'ValidPassword123', 'TEACHER');
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Welcome back!',
        })
      );
      expect(screen.getByTestId('teacher-dashboard')).toBeInTheDocument();
    });
  });

  it('preserves deep-link redirect when teacher accesses a permitted teacher route', async () => {
    mockLogin.mockResolvedValueOnce({
      id: 'teacher-1',
      name: 'Test Teacher',
      email: 'teacher@anuraguniversity.edu.in',
      role: 'TEACHER',
      active: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', search: '?role=teacher', state: { from: { pathname: '/teacher/delays' } } }]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/teacher/delays" element={<div data-testid="teacher-delays">Teacher Delays</div>} />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/teacher@anuraguniversity\.edu\.in/i), 'teacher@anuraguniversity.edu.in');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'ValidPassword123');
    await user.click(screen.getByRole('button', { name: /sign in as teacher/i }));

    await waitFor(() => {
      expect(screen.getByTestId('teacher-delays')).toBeInTheDocument();
    });
  });
});
