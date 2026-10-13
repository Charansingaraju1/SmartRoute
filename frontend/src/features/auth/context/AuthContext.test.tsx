// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '@/services/api';
import type { User, AuthResponse } from '@/types/api';

vi.mock('@/services/api', () => ({
  api: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('AuthContext Role Mismatch and Session Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('rejects login and wipes session if authoritative returned role does not match requested role', async () => {
    const studentUser: User = {
      id: 'student-id-123',
      name: 'Student User',
      email: 'student@anurag.edu',
      role: 'STUDENT',
      active: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    const mockResponse: AuthResponse = {
      accessToken: 'unintended-token',
      refreshToken: 'unintended-refresh',
      user: studentUser,
    };

    vi.mocked(api.login).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await expect(
        result.current.login('student@anurag.edu', 'Pass123!', 'TEACHER')
      ).rejects.toThrow('This account is registered as a Student. Please use Student Login.');
    });

    // Verifies tokens wiped and no user state retained
    expect(api.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('allows login when requested role matches authoritative user role', async () => {
    const teacherUser: User = {
      id: 'teacher-id-123',
      name: 'Teacher User',
      email: 'teacher@anurag.edu',
      role: 'TEACHER',
      active: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    const mockResponse: AuthResponse = {
      accessToken: 'valid-teacher-token',
      refreshToken: 'valid-teacher-refresh',
      user: teacherUser,
    };

    vi.mocked(api.login).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let authenticatedUser: User | null = null;
    await act(async () => {
      authenticatedUser = await result.current.login('teacher@anurag.edu', 'Pass123!', 'TEACHER');
    });

    expect(authenticatedUser).toEqual(teacherUser);
    expect(result.current.user).toEqual(teacherUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
