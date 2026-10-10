import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, Lock, Shield, Calendar, Settings, Edit2, Loader2, Truck, MapPin, GraduationCap, Bell, X, CheckCircle, AlertCircle, Wrench, Clock, MapPin as MapPinIcon } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherProfilePage() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['teacher-profile'],
    queryFn: () => api.getTeacherProfile(),
  });

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    designation: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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

  if (!editing) {
    setFormData({
      name: profile.user.name,
      department: profile.department || '',
      designation: profile.designation || '',
      phone: profile.phone || '',
    });
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">My Profile</h1>
        <p className="text-stone-600 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
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
              <form onSubmit={e => { e.preventDefault(); setEditing(false); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.user.email}
                      disabled
                      className="w-full rounded-lg border border-stone-300 bg-stone-100 px-4 py-2.5 text-sm text-stone-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={e => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-stone-200">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="px-6 py-2.5 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-terracotta-100 flex items-center justify-center">
                    <GraduationCap className="h-10 w-10 text-terracotta-600" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-charcoal-500">{profile.user.name}</h2>
                    <p className="text-stone-500">{profile.user.email}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-stone-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Email</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-charcoal-500">{profile.user.email}</p>
                        <Badge variant={profile.user.emailVerified ? 'success' : 'warning'} size="sm">
                          {profile.user.emailVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Employee ID</p>
                      <p className="font-mono text-lg font-bold text-charcoal-500">{profile.employeeId || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Department</p>
                      <p className="text-charcoal-500">{profile.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Designation</p>
                      <p className="text-charcoal-500">{profile.designation || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Phone</p>
                      <p className="text-charcoal-500">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
          </div>
        </div>
      </div>
  );
}
