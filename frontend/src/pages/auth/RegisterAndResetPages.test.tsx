// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StudentRegisterPage } from './StudentRegisterPage';
import { TeacherRegisterPage } from './TeacherRegisterPage';
import { ResetPasswordPage } from './ResetPasswordPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';

// Mock AuthContext
const mockForgotPassword = vi.fn();
const mockRegisterStudent = vi.fn();
const mockRegisterTeacher = vi.fn();
vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    registerStudent: mockRegisterStudent,
    registerTeacher: mockRegisterTeacher,
    resetPassword: vi.fn(),
    forgotPassword: mockForgotPassword,
  }),
  getAuthState: () => ({
    verifyOTP: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

// Mock useToast
vi.mock('@/components/ui/Toaster', () => ({
  useToast: () => ({
    addToast: vi.fn(),
    toasts: [],
    removeToast: vi.fn(),
  }),
}));

describe('StudentRegisterPage UI Improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderStudentRegister = () => {
    return render(
      <MemoryRouter initialEntries={['/register/student']}>
        <Routes>
          <Route path="/register/student" element={<StudentRegisterPage />} />
          <Route path="/register/teacher" element={<div data-testid="teacher-register-route">Teacher Register Route</div>} />
          <Route path="/login" element={<div data-testid="login-route">Login Route</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders independent password and confirm password show/hide toggles', async () => {
    renderStudentRegister();
    const user = userEvent.setup();

    const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    const showPasswordBtn = screen.getByRole('button', { name: /^show password$/i });
    const showConfirmBtn = screen.getByRole('button', { name: /^show confirm password$/i });

    // Toggle password only
    await user.click(showPasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Toggle confirm password only
    await user.click(showConfirmBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    // Hide password
    await user.click(screen.getByRole('button', { name: /^hide password$/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('includes RoleSelector with Student active and switching navigates to Teacher registration', async () => {
    renderStudentRegister();
    const user = userEvent.setup();

    const studentTab = screen.getByRole('tab', { name: /student/i });
    const teacherTab = screen.getByRole('tab', { name: /teacher/i });

    expect(studentTab).toHaveAttribute('aria-selected', 'true');
    expect(teacherTab).toHaveAttribute('aria-selected', 'false');

    await user.click(teacherTab);
    expect(screen.getByTestId('teacher-register-route')).toBeInTheDocument();
  });

  it('includes sign in link that preserves student role', () => {
    renderStudentRegister();

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toHaveAttribute('href', '/login?role=student');
  });

  it('registers student and redirects to /login?role=student without OTP screen', async () => {
    mockRegisterStudent.mockResolvedValueOnce({
      requiresOTPVerification: false,
      message: 'Registration successful. Email verification skipped for local development.'
    });

    renderStudentRegister();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/enter your full name/i), 'Dev Student');
    await user.type(screen.getByPlaceholderText(/student@anuraguniversity\.edu\.in/i), 'student@anuraguniversity.edu.in');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'Password123!');
    await user.type(screen.getByPlaceholderText(/re-enter your password/i), 'Password123!');

    await user.click(screen.getByRole('button', { name: /create student account/i }));

    expect(await screen.findByTestId('login-route')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /verify your email/i })).not.toBeInTheDocument();
  });
});

describe('TeacherRegisterPage UI Improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderTeacherRegister = () => {
    return render(
      <MemoryRouter initialEntries={['/register/teacher']}>
        <Routes>
          <Route path="/register/teacher" element={<TeacherRegisterPage />} />
          <Route path="/register/student" element={<div data-testid="student-register-route">Student Register Route</div>} />
          <Route path="/login" element={<div data-testid="login-route">Login Route</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders independent password and confirm password show/hide toggles', async () => {
    renderTeacherRegister();
    const user = userEvent.setup();

    const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    const showPasswordBtn = screen.getByRole('button', { name: /^show password$/i });
    const showConfirmBtn = screen.getByRole('button', { name: /^show confirm password$/i });

    await user.click(showPasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    await user.click(showConfirmBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('includes RoleSelector with Teacher active and switching navigates to Student registration', async () => {
    renderTeacherRegister();
    const user = userEvent.setup();

    const studentTab = screen.getByRole('tab', { name: /student/i });
    const teacherTab = screen.getByRole('tab', { name: /teacher/i });

    expect(teacherTab).toHaveAttribute('aria-selected', 'true');
    expect(studentTab).toHaveAttribute('aria-selected', 'false');

    await user.click(studentTab);
    expect(screen.getByTestId('student-register-route')).toBeInTheDocument();
  });

  it('includes sign in link that preserves teacher role', () => {
    renderTeacherRegister();

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toHaveAttribute('href', '/login?role=teacher');
  });

  it('registers teacher and redirects to /login?role=teacher without OTP screen', async () => {
    mockRegisterTeacher.mockResolvedValueOnce({
      requiresOTPVerification: false,
      message: 'Registration successful. Email verification skipped for local development.'
    });

    renderTeacherRegister();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/enter your full name/i), 'Dev Teacher');
    await user.type(screen.getByPlaceholderText(/teacher@anuraguniversity\.edu\.in/i), 'teacher@anuraguniversity.edu.in');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'Password123!');
    await user.type(screen.getByPlaceholderText(/re-enter your password/i), 'Password123!');

    await user.click(screen.getByRole('button', { name: /create teacher account/i }));

    expect(await screen.findByTestId('login-route')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /verify your email/i })).not.toBeInTheDocument();
  });
});

describe('ResetPasswordPage UI Improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderResetPassword = () => {
    return render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/login" element={<div data-testid="login-route">Login Route</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders independent show/hide toggles for new password and confirm new password', async () => {
    renderResetPassword();
    const user = userEvent.setup();

    const newPasswordInput = screen.getByPlaceholderText(/at least 8 characters/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);

    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    const showNewBtn = screen.getByRole('button', { name: /^show password$/i });
    const showConfirmBtn = screen.getByRole('button', { name: /^show confirm password$/i });

    await user.click(showNewBtn);
    expect(newPasswordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    await user.click(showConfirmBtn);
    expect(newPasswordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('includes back to sign in link', () => {
    renderResetPassword();

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toHaveAttribute('href', '/login');
  });
});

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderForgotPassword = () => {
    return render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/login" element={<div data-testid="login-route">Login Route</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders email input, back link, and submit button', () => {
    renderForgotPassword();

    expect(screen.getByRole('heading', { name: /forgot password\?/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/student@anuraguniversity\.edu\.in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset code/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to sign in/i })).toHaveAttribute('href', '/login');
  });

  it('displays configuration error banner when SMTP is unconfigured', async () => {
    mockForgotPassword.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Password reset is unavailable: Email delivery is not configured. Please configure valid MAIL_USERNAME and MAIL_PASSWORD (requires a Google App Password for Gmail) in .env.'
        }
      }
    });

    renderForgotPassword();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/student@anuraguniversity\.edu\.in/i);
    await user.type(emailInput, 'student@anuraguniversity.edu.in');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/email delivery is not configured/i)).toBeInTheDocument();
  });

  it('advances to OTP verification step when forgotPassword succeeds', async () => {
    mockForgotPassword.mockResolvedValueOnce(undefined);

    renderForgotPassword();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/student@anuraguniversity\.edu\.in/i);
    await user.type(emailInput, 'student@anuraguniversity.edu.in');
    await user.click(screen.getByRole('button', { name: /send reset code/i }));

    expect(await screen.findByRole('heading', { name: /verify your identity/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify code/i })).toBeInTheDocument();
  });
});
