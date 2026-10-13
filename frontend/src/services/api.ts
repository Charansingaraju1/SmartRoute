import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  VerifyOTPRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  ResendOTPRequest, 
  User 
} from '@/types/api';
import type { 
  Bus, 
  Route, 
  BoardingPoint, 
  Zone, 
  Student, 
  Teacher 
} from '@/types/transport';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

class ApiService {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadTokens();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.accessToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData && config.headers) {
          delete config.headers['Content-Type'];
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        const isAuthEndpoint = Boolean(originalRequest?.url?.includes('/auth/'));

        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken && !isAuthEndpoint) {
          originalRequest._retry = true;
          
          try {
            const response = await this.refreshAccessToken();
            this.setTokens(response.accessToken!, response.refreshToken!);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 403) {
          // Handle forbidden - could redirect or show error
        }

        return Promise.reject(error);
      }
    );
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async registerStudent(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<{ success: boolean; data: AuthResponse }>('/auth/register/student', data);
    // Do NOT store tokens here — registration redirects to /login.
    // The user must complete a fresh login cycle to set up their session.
    return response.data.data;
  }

  async registerTeacher(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<{ success: boolean; data: AuthResponse }>('/auth/register/teacher', data);
    // Do NOT store tokens here — registration redirects to /login.
    // The user must complete a fresh login cycle to set up their session.
    return response.data.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    this.clearTokens();
    const response = await this.client.post<{ success: boolean; data: AuthResponse }>('/auth/login', data);
    if (response.data.data?.accessToken) {
      this.setTokens(response.data.data.accessToken, response.data.data.refreshToken!);
    }
    return response.data.data;
  }

  async loginWithGoogle(idToken: string, role?: 'STUDENT' | 'TEACHER'): Promise<AuthResponse> {
    this.clearTokens();
    const response = await this.client.post<{ success: boolean; data: AuthResponse }>('/auth/google', { idToken, role });
    if (response.data.data?.accessToken) {
      this.setTokens(response.data.data.accessToken, response.data.data.refreshToken!);
    }
    return response.data.data;
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<void> {
    await this.client.post('/auth/verify-otp', data);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await this.client.post('/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await this.client.post('/auth/reset-password', data);
  }

  async resendOTP(data: ResendOTPRequest): Promise<void> {
    await this.client.post('/auth/resend-otp', data);
  }

  async refreshAccessToken(): Promise<AuthResponse> {
    const response = await this.client.post<{ success: boolean; data: AuthResponse }>('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${this.refreshToken}` }
    });
    return response.data.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<{ success: boolean; data: any }>('/auth/me');
    return (response.data.data?.user || response.data.data) as User;
  }

  async verifyBus(identifier: string) {
    const response = await this.client.get<{ success: boolean; data: any; message?: string }>(`/buses/verify/${encodeURIComponent(identifier)}`);
    return response.data.data;
  }

  // Transport APIs
  async getZones() {
    const response = await this.client.get<{ success: boolean; data: any[] }>('/buses/zones');
    return response.data.data;
  }

  async getBuses() {
    const response = await this.client.get<{ success: boolean; data: any[] }>('/buses');
    return response.data.data;
  }

  async getBus(id: string) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/buses/${id}`);
    return response.data.data;
  }

  async getRoutes(zoneId?: string, direction?: string) {
    const params = new URLSearchParams();
    if (zoneId) params.append('zoneId', zoneId);
    if (direction) params.append('direction', direction);
    params.append('size', '100');
    const response = await this.client.get<{ success: boolean; data: any }>(`/routes?${params}`);
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.content || []);
  }

  async getRoute(id: string) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/routes/${id}`);
    return response.data.data;
  }

  async getStops(routeId: string) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/stops?routeId=${routeId}`);
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.content || []);
  }

  // Student APIs
  async getStudentProfile() {
    const response = await this.client.get<{ success: boolean; data: any }>('/student/profile');
    return response.data.data;
  }

  async getStudentAssignment() {
    const response = await this.client.get<{ success: boolean; data: any }>('/student/assignment');
    return response.data.data;
  }

  async getStudentBus() {
    const response = await this.client.get<{ success: boolean; data: any }>('/student/bus');
    return response.data.data;
  }

  async getStudentNotifications(page = 0, size = 20) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/student/notifications?page=${page}&size=${size}`);
    return response.data.data;
  }

  // Teacher APIs
  async getTeacherProfile() {
    const response = await this.client.get<{ success: boolean; data: any }>('/teacher/profile');
    return response.data.data;
  }

  async updateTeacherProfile(data: { name?: string; department?: string; designation?: string; phone?: string }) {
    const response = await this.client.put<{ success: boolean; data: any }>('/teacher/profile', data);
    return response.data.data;
  }

  async getTeacherBuses() {
    const response = await this.client.get<{ success: boolean; data: any[] }>('/teacher/buses');
    return response.data.data;
  }

  async getBusStudents(busId: string) {
    const response = await this.client.get<{ success: boolean; data: any[] }>(`/teacher/bus/${busId}/students`);
    return response.data.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/actuator/health');
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Additional Student APIs
  async getStudentMissedBus() {
    const response = await this.client.get<{ success: boolean; data: any[] }>('/student/missed-bus');
    return response.data.data;
  }

  async getStudentSOS() {
    const response = await this.client.get<{ success: boolean; data: any[] }>('/student/sos');
    return response.data.data;
  }

  async getStudentBusPass() {
    const response = await this.client.get<{ success: boolean; data: any }>('/student/bus-pass');
    return response.data.data;
  }

  async getStudentGPS() {
    const response = await this.client.get<{ success: boolean; data: any }>('/student/gps');
    return response.data.data;
  }

  async getStudentPayments(page = 0, size = 20) {
    // Backend route: PaymentController @RequestMapping("/payment") + @GetMapping("/student/payments")
    const response = await this.client.get<{ success: boolean; data: any }>(`/payment/student/payments?page=${page}&size=${size}`);
    return response.data.data;
  }

  async postStudentMissedBus(data: any) {
    const response = await this.client.post<{ success: boolean; data: any }>('/student/missed-bus', data);
    return response.data.data;
  }

  async postStudentSOS(data: any) {
    const response = await this.client.post<{ success: boolean; data: any }>('/student/sos', data);
    return response.data.data;
  }

  async postStudentBusPass(data: FormData) {
    const response = await this.client.post<{ success: boolean; data: any }>('/student/bus-pass', data, {
      headers: { 'Content-Type': undefined }
    });
    return response.data.data;
  }

  // Teacher APIs
  async getTeacherMissedBus(page = 0, size = 50) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/teacher/missed-bus?page=${page}&size=${size}`);
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.content || []);
  }

  async getTeacherDelays(page = 0, size = 50) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/teacher/delays?page=${page}&size=${size}`);
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.content || []);
  }

  async getTeacherDisruptions(page = 0, size = 50) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/teacher/disruptions?page=${page}&size=${size}`);
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.content || []);
  }

  async getTeacherSOS(page = 0, size = 50) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/teacher/sos?page=${page}&size=${size}`);
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.content || []);
  }

  async getTeacherTransportOps() {
    const response = await this.client.get<{ success: boolean; data: any[] }>('/teacher/transport-ops');
    return response.data.data;
  }

  async getTeacherNotifications(page = 0, size = 20) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/teacher/notifications?page=${page}&size=${size}`);
    return response.data.data;
  }

  async getTeacherAssignments() {
    const response = await this.client.get<{ success: boolean; data: any[] }>('/teacher/assignments');
    return response.data.data;
  }

  async getTeacherStudents() {
    const response = await this.client.get<{ success: boolean; data: any[] }>('/teacher/students');
    return response.data.data;
  }

  async createTeacherAssignment(data: {
    studentId: string;
    busId: string;
    routeId: string;
    boardingPointId?: string;
    direction?: string;
    startDate?: string;
    endDate?: string;
    assignmentNotes?: string;
  }) {
    const response = await this.client.post<{ success: boolean; data: any }>('/teacher/assignments', data);
    return response.data.data;
  }

  async updateTeacherAssignment(id: string, data: {
    busId?: string;
    routeId?: string;
    boardingPointId?: string;
    direction?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    assignmentNotes?: string;
  }) {
    const response = await this.client.put<{ success: boolean; data: any }>(`/teacher/assignments/${id}`, data);
    return response.data.data;
  }

  async deleteTeacherAssignment(id: string, reason?: string) {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    const response = await this.client.delete<{ success: boolean; data: any }>(`/teacher/assignments/${id}${params}`);
    return response.data.data;
  }

  async getTeacherBusStudents(busId: string) {
    // Backend: GET /teacher/bus/{busId}/students — enforces teacher-bus ownership
    const response = await this.client.get<{ success: boolean; data: any[] }>(`/teacher/bus/${busId}/students`);
    return response.data.data ?? [];
  }

  async postTeacherDelay(data: any) {
    const response = await this.client.post<{ success: boolean; data: any }>('/teacher/delays', data);
    return response.data.data;
  }

  async postTeacherDisruption(data: any) {
    const response = await this.client.post<{ success: boolean; data: any }>('/teacher/disruptions', data);
    return response.data.data;
  }

  async acknowledgeMissedBus(id: string) {
    const response = await this.client.post<{ success: boolean; data: any }>(`/teacher/missed-bus/${id}/acknowledge`);
    return response.data.data;
  }

  async assignAlternativeBus(requestId: string, alternativeBusId: string, notes?: string) {
    const payload: { alternativeBusId: string; notes?: string } = { alternativeBusId };
    if (notes && notes.trim().length > 0) {
      payload.notes = notes.trim();
    }
    const response = await this.client.post<{ success: boolean; data: any }>(`/teacher/missed-bus/${requestId}/alternative`, payload);
    return response.data.data;
  }

  async resolveMissedBus(id: string) {
    const response = await this.client.post<{ success: boolean; data: any }>(`/teacher/missed-bus/${id}/resolve`);
    return response.data.data;
  }

  async acknowledgeDelay(id: string) {
    const response = await this.client.post<{ success: boolean; data: any }>(`/teacher/delays/${id}/acknowledge`);
    return response.data.data;
  }

  async resolveDelay(id: string) {
    const response = await this.client.post<{ success: boolean; data: any }>(`/teacher/delays/${id}/resolve`);
    return response.data.data;
  }

  async acknowledgeDisruption(id: string) {
    const response = await this.client.post<{ success: boolean; data: any }>(`/teacher/disruptions/${id}/acknowledge`);
    return response.data.data;
  }

  async resolveDisruption(id: string) {
    const response = await this.client.post<{ success: boolean; data: any }>(`/teacher/disruptions/${id}/resolve`);
    return response.data.data;
  }

  async acknowledgeSOS(id: string) {
    const response = await this.client.post<{ success: boolean; data: any }>(`/teacher/sos/${id}/acknowledge`);
    return response.data.data;
  }

  async respondSOS(id: string) {
    const response = await this.client.post<{ success: boolean; data: any }>(`/teacher/sos/${id}/respond`);
    return response.data.data;
  }

  async resolveSOS(id: string, notes: string) {
    const response = await this.client.post<{ success: boolean; data: any }>(`/teacher/sos/${id}/resolve`, { notes });
    return response.data.data;
  }

  // Transport Import
  async importTransportWorkbook() {
    const response = await this.client.post<{ success: boolean; data: any }>('/transport/import');
    return response.data.data;
  }

  // Payment APIs
  async getPaymentHistory(page = 0, size = 20) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/payment/student/payments?page=${page}&size=${size}`);
    return response.data.data;
  }

  async initiatePayment(data: any) {
    const response = await this.client.post<{ success: boolean; data: any }>('/payment/initiate', data);
    return response.data.data;
  }

  // Notification APIs
  async markNotificationAsRead(id: string) {
    const response = await this.client.post<{ success: boolean; data: any }>(`/notifications/${id}/read`);
    return response.data.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.client.post<{ success: boolean; data: any }>('/notifications/read-all');
    return response.data.data;
  }

  // GPS APIs
  async postStudentLocation(data: any) {
    const response = await this.client.post<{ success: boolean; data: any }>('/student/location', data);
    return response.data.data;
  }

  async getBusLocation(busId: string) {
    const response = await this.client.get<{ success: boolean; data: any }>(`/buses/${busId}/location`);
    return response.data.data;
  }
}

export const api = new ApiService();