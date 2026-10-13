export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER';
  active: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: User;
  message?: string;
  email?: string;
  requiresOTPVerification?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role?: 'STUDENT' | 'TEACHER';
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  type: 'REGISTRATION' | 'FORGOT_PASSWORD' | 'LOGIN' | 'EMAIL_VERIFICATION';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  otp: string;
  newPassword: string;
  confirmPassword: string;
  email?: string;
}

export interface ResendOTPRequest {
  email: string;
  type: 'REGISTRATION' | 'FORGOT_PASSWORD' | 'LOGIN' | 'EMAIL_VERIFICATION';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
  traceId?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}