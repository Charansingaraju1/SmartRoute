import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, Lock, GraduationCap, Calendar, Settings, Edit2, Loader2, Shield, Bell, Truck, MapPin, CreditCard, XCircle, Camera, Image, Save, X, AlertCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '@/features/auth/context/AuthContext';

interface StudentProfile {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'TEACHER';
    active: boolean;
    emailVerified: boolean;
    lastLoginAt?: string;
    createdAt: string;
  };
  studentId?: string;
  branch?: string;
  classSection?: string;
  academicYear?: string;
  bus?: { id: string; registrationNumber: string; route?: { routeCode: string; routeName?: string } };
  route?: { id: string; routeCode: string; routeName?: string; direction: string };
  boardingPoint?: { id: string; stopName: string; stopTime?: string };
  direction?: 'MORNING' | 'EVENING';
  pickupTime?: string;
  assignmentStatus?: string;
  busPassVerified: boolean;
  busPassVerifiedAt?: string;
  busPassImageUrl?: string;
  qrCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notificationEmailEnabled: boolean;
  notificationPushEnabled: boolean;
  notificationInAppEnabled: boolean;
  sosNotificationEnabled: boolean;
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function StudentProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => api.getStudentProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // TODO: Implement update profile API
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      setEditing(false);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      // TODO: Implement change password API
      return data;
    },
    onSuccess: () => {
      setChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
  });

  const studentUser = profile?.user || user;

  useEffect(() => {
    if ((profile || user) && !editing) {
      setFormData({
        name: studentUser?.name || '',
        emergencyContactName: profile?.emergencyContactName || '',
        emergencyContactPhone: profile?.emergencyContactPhone || '',
      });
    }
  }, [profile, user, editing, studentUser]);

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 rounded w-3/4"></div>
          <div className="h-64 bg-stone-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container-app py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load profile</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">My Profile</h1>
        <p className="text-stone-600 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-semibold text-charcoal-500 flex items-center gap-2">
                <User className="h-5 w-5 text-terracotta-500" />
                Personal Information
              </h2>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 text-sm font-medium text-terracotta-600 hover:text-terracotta-700 hover:underline"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </button>
            </div>

            {editing ? (
              <form onSubmit={e => { e.preventDefault(); updateProfileMutation.mutate(formData); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:bg-stone-50 dark:focus:bg-[#111827] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={studentUser?.email || ''}
                      disabled
                      className="w-full rounded-lg border border-stone-300 dark:border-slate-800 bg-stone-100 dark:bg-slate-900 px-4 py-2.5 text-sm text-stone-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:bg-stone-50 dark:focus:bg-[#111827] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:bg-stone-50 dark:focus:bg-[#111827] focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-[#334155]">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="px-6 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2"
                  >
                    {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-2.5 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Full Name</p>
                    <p className="font-medium text-lg text-charcoal-500">{studentUser?.name || 'Student'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-charcoal-500">{studentUser?.email || ''}</p>
                      <Badge variant={studentUser?.emailVerified ? 'success' : 'warning'} size="sm">
                        {studentUser?.emailVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Student ID</p>
                  <p className="font-mono text-lg font-bold text-charcoal-500">{profile.studentId || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Branch</p>
                  <p className="text-charcoal-500">{profile.branch || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Class/Section</p>
                  <p className="text-charcoal-500">{profile.classSection || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Academic Year</p>
                  <p className="text-charcoal-500">{profile.academicYear || 'Not specified'}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Transport Assignment */}
          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <Truck className="h-5 w-5 text-terracotta-500" />
              Transport Assignment
            </h2>

            {profile.bus || profile.route ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-terracotta-50 rounded-xl p-4 border border-terracotta-100">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Bus</p>
                  <p className="font-mono text-lg font-bold text-charcoal-500">{profile.bus?.registrationNumber || 'Not assigned'}</p>
                  {profile.bus?.route && (
                    <p className="text-sm text-stone-500 mt-1">{profile.bus.route.routeCode} - {profile.bus.route.routeName}</p>
                  )}
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Route</p>
                  <p className="font-mono text-lg font-bold text-charcoal-500">{profile.route?.routeCode || 'Not assigned'}</p>
                  <p className="text-sm text-stone-500 mt-1">{profile.route?.routeName || 'Unnamed Route'}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Boarding Point</p>
                  <p className="font-medium text-charcoal-500">{profile.boardingPoint?.stopName || 'Not assigned'}</p>
                  {profile.boardingPoint?.stopTime && (
                    <p className="text-sm text-stone-500 mt-1"><span className="font-mono">{profile.boardingPoint.stopTime}</span></p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No Transport Assignment</h3>
                <p className="text-stone-500 mb-4">You don't have an active bus assignment yet.</p>
                <button className="px-4 py-2 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors">
                  Browse Available Buses
                </button>
              </div>
            )}

            {profile.pickupTime && (
              <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Pickup Time</p>
                    <p className="font-mono text-lg font-bold text-charcoal-500">{profile.pickupTime}</p>
                  </div>
                </div>
              </div>
            )}

            {profile.direction && (
              <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Direction</p>
                <Badge variant={profile.direction === 'MORNING' ? 'info' : 'warning'}>
                  {profile.direction === 'MORNING' ? 'Morning (Home → College)' : 'Evening (College → Home)'}
                </Badge>
              </div>
            )}

            <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Assignment Status</p>
              <Badge variant={profile.assignmentStatus === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                {profile.assignmentStatus || 'Not assigned'}
              </Badge>
            </div>
            </Card>

          {/* Emergency Contact */}
          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-terracotta-500" />
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Name</p>
                <p className="font-medium text-charcoal-500">{profile.emergencyContactName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Phone</p>
                <p className="font-medium text-charcoal-500">{profile.emergencyContactPhone || 'Not provided'}</p>
              </div>
            </div>
            </Card>

          {/* Account Security */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-semibold text-charcoal-500 flex items-center gap-2">
                <Shield className="h-5 w-5 text-terracotta-500" />
                Account Security
              </h2>
              <button
                onClick={() => setChangingPassword(true)}
                className="px-3 py-1.5 text-sm font-medium text-terracotta-600 hover:text-terracotta-700 hover:underline"
              >
                <Lock className="h-4 w-4 mr-1" />
                Change Password
              </button>
            </div>

            {changingPassword ? (
              <form onSubmit={e => { e.preventDefault(); changePasswordMutation.mutate(passwordForm); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="px-6 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2"
                  >
                    {changePasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => { setChangingPassword(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                    className="px-6 py-2.5 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800 text-center">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Account Status</p>
                  <Badge variant={studentUser?.active !== false ? 'success' : 'danger'} size="sm">
                    {studentUser?.active !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800 text-center">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Email Verified</p>
                  <Badge variant={studentUser?.emailVerified ? 'success' : 'warning'} size="sm">
                    {studentUser?.emailVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800 text-center">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Last Login</p>
                  <p className="text-charcoal-500 dark:text-[#F1F5F9]">{studentUser?.lastLoginAt ? new Date(studentUser.lastLoginAt).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Notification Preferences */}
          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-[#F1F5F9] mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-terracotta-500" />
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-[#111827] rounded-lg border border-stone-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">Email Notifications</p>
                    <p className="text-sm text-stone-500 dark:text-slate-400">Receive notifications via email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notificationEmailEnabled}
                  onChange={e => { /* TODO: update preference */ }}
                  className="w-5 h-5 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-[#111827] rounded-lg border border-stone-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">Push Notifications</p>
                    <p className="text-sm text-stone-500 dark:text-slate-400">Receive push notifications on your device</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notificationPushEnabled}
                  onChange={e => { /* TODO: update preference */ }}
                  className="w-5 h-5 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-[#111827] rounded-lg border border-stone-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">In-App Notifications</p>
                    <p className="text-sm text-stone-500 dark:text-slate-400">Receive notifications within the app</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notificationInAppEnabled}
                  onChange={e => { /* TODO: update preference */ }}
                  className="w-5 h-5 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-[#111827] rounded-lg border border-stone-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">SOS Notifications</p>
                    <p className="text-sm text-stone-500 dark:text-slate-400">Receive emergency SOS alerts (cannot be disabled)</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-5 h-5 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500 opacity-50 cursor-not-allowed"
                />
              </div>
            </div>
            </Card>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-[#F1F5F9] mb-6 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-terracotta-500" />
              Account Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Role</p>
                  <Badge variant="secondary">{studentUser?.role || 'STUDENT'}</Badge>
                </div>
                <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Account Created</p>
                  <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{studentUser?.createdAt ? new Date(studentUser.createdAt).toLocaleDateString() : 'Active'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-stone-200 dark:border-slate-800">
                <p className="text-sm text-stone-500 dark:text-slate-400">Need help? Contact <a href="mailto:transport@anuraguniversity.edu.in" className="text-terracotta-600 hover:underline">transport@anuraguniversity.edu.in</a></p>
              </div>
            </div>
            </Card>

          {/* Danger Zone */}
          <Card padding="lg" className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
            <h2 className="font-heading text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">These actions are irreversible. Please proceed with caution.</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Deactivate Account
              </button>
            </div>
            </Card>
        </div>
      </div>
    </div>
  );
}