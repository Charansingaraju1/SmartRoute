import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/services/api';
import type { User, AuthResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'STUDENT' | 'TEACHER') => Promise<User | null>;
  loginWithGoogle: (idToken: string, role?: 'STUDENT' | 'TEACHER') => Promise<User | null>;
  registerStudent: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<AuthResponse>;
  registerTeacher: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<AuthResponse>;
  verifyOTP: (email: string, otp: string, type: 'REGISTRATION' | 'FORGOT_PASSWORD' | 'LOGIN' | 'EMAIL_VERIFICATION') => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string, confirmPassword: string) => Promise<void>;
  resendOTP: (email: string, type: 'REGISTRATION' | 'FORGOT_PASSWORD' | 'LOGIN' | 'EMAIL_VERIFICATION') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: 'STUDENT' | 'TEACHER') => boolean;
}

// Store reference for getState pattern
let authContextRef: AuthContextType | null = null;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!api.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, role?: 'STUDENT' | 'TEACHER'): Promise<User | null> => {
    const response = await api.login({ email, password, role });
    if (response.user) {
      // Authoritative client-side verification defense-in-depth:
      // If a role was requested and doesn't match the server-returned authoritative user role,
      // reject immediately and wipe any stored tokens.
      if (role && response.user.role !== role) {
        await api.logout();
        setUser(null);
        throw new Error(
          response.user.role === 'TEACHER'
            ? 'This account is registered as a Teacher. Please use Teacher Login.'
            : 'This account is registered as a Student. Please use Student Login.'
        );
      }
      setUser(response.user);
      return response.user;
    }
    return null;
  };

  const loginWithGoogle = async (idToken: string, role?: 'STUDENT' | 'TEACHER'): Promise<User | null> => {
    const response = await api.loginWithGoogle(idToken, role);
    if (response.user) {
      if (role && response.user.role !== role) {
        await api.logout();
        setUser(null);
        throw new Error(
          response.user.role === 'TEACHER'
            ? 'This account is registered as a Teacher. Please use Teacher Login.'
            : 'This account is registered as a Student. Please use Student Login.'
        );
      }
      setUser(response.user);
      return response.user;
    }
    return null;
  };

  const registerStudent = async (data: { name: string; email: string; password: string; confirmPassword: string }): Promise<AuthResponse> => {
    return await api.registerStudent(data);
  };

  const registerTeacher = async (data: { name: string; email: string; password: string; confirmPassword: string }): Promise<AuthResponse> => {
    return await api.registerTeacher(data);
  };

  const verifyOTP = async (email: string, otp: string, type: 'REGISTRATION' | 'FORGOT_PASSWORD' | 'LOGIN' | 'EMAIL_VERIFICATION') => {
    await api.verifyOTP({ email, otp, type });
  };

  const forgotPassword = async (email: string) => {
    await api.forgotPassword({ email });
  };

  const resetPassword = async (email: string, otp: string, newPassword: string, confirmPassword: string) => {
    await api.resetPassword({ otp, newPassword, confirmPassword, email });
  };

  const resendOTP = async (email: string, type: 'REGISTRATION' | 'FORGOT_PASSWORD' | 'LOGIN' | 'EMAIL_VERIFICATION') => {
    await api.resendOTP({ email, type });
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const hasRole = (role: 'STUDENT' | 'TEACHER') => {
    return user?.role === role;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    registerStudent,
    registerTeacher,
    verifyOTP,
    forgotPassword,
    resetPassword,
    resendOTP,
    logout,
    refreshUser,
    hasRole,
  };

  // Store reference for getState pattern
  authContextRef = value;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Static getState method for non-React contexts
export function getAuthState(): AuthContextType | null {
  return authContextRef;
}