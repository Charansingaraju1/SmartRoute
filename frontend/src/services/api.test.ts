// @vitest-environment jsdom
/**
 * Tests that registerStudent / registerTeacher do NOT write tokens to
 * localStorage, so that users arriving at /login after registration are
 * always required to sign in explicitly.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock axios BEFORE the api module is imported ─────────────────────────────
const mockPost = vi.fn();

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        post: mockPost,
        get: vi.fn(),
        interceptors: {
          request:  { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
    },
  };
});

// ── Import the api singleton AFTER the mock is set up ─────────────────────────
const { api } = await import('./api');

// ── Helpers ───────────────────────────────────────────────────────────────────
const authPayload = (role: string) => ({
  data: {
    success: true,
    data: {
      accessToken:  'fake-access-token',
      refreshToken: 'fake-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 86400000,
      requiresOTPVerification: false,
      email: 'user@example.com',
      message: 'Registration successful. Email verification skipped for local development.',
      user: { id: 'uuid-1', name: 'Test User', email: 'user@example.com', role },
    },
  },
});

const studentReq = {
  name: 'Dev Student',
  email: 'student@example.com',
  password: 'Password1!',
  confirmPassword: 'Password1!',
};

const teacherReq = {
  name: 'Dev Teacher',
  email: 'teacher@example.com',
  password: 'Password1!',
  confirmPassword: 'Password1!',
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('api.registerStudent / api.registerTeacher – no token storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('registerStudent does not write accessToken to localStorage', async () => {
    mockPost.mockResolvedValueOnce(authPayload('STUDENT'));
    await api.registerStudent(studentReq);

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('registerTeacher does not write accessToken to localStorage', async () => {
    mockPost.mockResolvedValueOnce(authPayload('TEACHER'));
    await api.registerTeacher(teacherReq);

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('registerStudent still returns the full AuthResponse payload', async () => {
    mockPost.mockResolvedValueOnce(authPayload('STUDENT'));
    const result = await api.registerStudent(studentReq);

    expect(result.requiresOTPVerification).toBe(false);
    expect(result.accessToken).toBe('fake-access-token');
    expect(result.user?.role).toBe('STUDENT');
  });
});

describe('api.assignAlternativeBus – payload verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends alternativeBusId in request body to backend', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true, data: { id: 'req-1', status: 'ALTERNATIVE_BUS_ASSIGNED' } } });

    await api.assignAlternativeBus('req-1', 'bus-uuid-123');

    expect(mockPost).toHaveBeenCalledWith(
      '/teacher/missed-bus/req-1/alternative',
      { alternativeBusId: 'bus-uuid-123' }
    );
  });

  it('includes trimmed notes in payload when provided', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true, data: { id: 'req-1', status: 'ALTERNATIVE_BUS_ASSIGNED' } } });

    await api.assignAlternativeBus('req-1', 'bus-uuid-123', '  Take bus 10 from stop B  ');

    expect(mockPost).toHaveBeenCalledWith(
      '/teacher/missed-bus/req-1/alternative',
      { alternativeBusId: 'bus-uuid-123', notes: 'Take bus 10 from stop B' }
    );
  });
});
