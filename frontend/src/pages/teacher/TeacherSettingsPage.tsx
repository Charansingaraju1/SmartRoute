import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Settings, Bell, Shield, Lock, Globe, Moon, Monitor, Smartphone, Palette, Save, Loader2, AlertCircle, AlertTriangle, Shield as ShieldIcon, MapPin, Truck, Download, Mail, BarChart } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherSettingsPage() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['teacher-profile'],
    queryFn: () => api.getTeacherProfile(),
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    inApp: true,
    sos: true,
  });
  const [privacy, setPrivacy] = useState({
    locationSharing: true,
    dataCollection: true,
    analytics: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

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

  if (error) {
    return (
      <div className="container-app py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load settings</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">Settings</h1>
        <p className="text-stone-600 mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <Palette className="h-5 w-5 text-terracotta-500" />
              Appearance
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'system'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t as 'light' | 'dark' | 'system')}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        theme === t
                          ? 'border-terracotta-500 bg-terracotta-50'
                          : 'border-stone-200 hover:border-terracotta-300'
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                        style={{
                          backgroundColor: t === 'light' ? '#ffffff' : t === 'dark' ? '#1C1917' : 'linear-gradient(135deg, #ffffff 50%, #1C1917 50%)'
                        }}>
                      </div>
                      <p className="font-medium text-charcoal-500 capitalize">{t}</p>
                      <p className="text-xs text-stone-500 text-center">
                        {t === 'light' ? 'Light mode' : t === 'dark' ? 'Dark mode' : 'System preference'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-stone-200">
                <label className="block text-sm font-medium text-stone-700 mb-3">Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-terracotta-500" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Email Notifications</p>
                    <p className="text-sm text-stone-500">Receive notifications via email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={e => setNotifications({ ...notifications, email: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Push Notifications</p>
                    <p className="text-sm text-stone-500">Receive push notifications on your device</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={e => setNotifications({ ...notifications, push: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">In-App Notifications</p>
                    <p className="text-sm text-stone-500">Receive notifications within the app</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.inApp}
                  onChange={e => setNotifications({ ...notifications, inApp: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">SOS Notifications</p>
                    <p className="text-sm text-stone-500">Receive emergency SOS alerts (cannot be disabled)</p>
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

          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-terracotta-500" />
              Privacy & Data
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Location Sharing</p>
                    <p className="text-sm text-stone-500">Share location with transport staff during active trips</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.locationSharing}
                  onChange={e => setPrivacy({ ...privacy, locationSharing: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Data Collection</p>
                    <p className="text-sm text-stone-500">Allow collection of usage data for service improvement</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.dataCollection}
                  onChange={e => setPrivacy({ ...privacy, dataCollection: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BarChart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Analytics</p>
                    <p className="text-sm text-stone-500">Help improve the app by sharing anonymous usage analytics</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.analytics}
                  onChange={e => setPrivacy({ ...privacy, analytics: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-terracotta-500" />
              Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-terracotta-100 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-terracotta-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Two-Factor Authentication</p>
                    <p className="text-sm text-stone-500">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors text-sm font-medium">
                  Enable 2FA
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-terracotta-100 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-terracotta-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Active Sessions</p>
                    <p className="text-sm text-stone-500">View and manage devices logged into your account</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors text-sm font-medium">
                  Manage Sessions
                </button>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="border-red-200 bg-red-50">
            <h2 className="font-heading text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Data Management
            </h2>
            <p className="text-red-600 mb-4">These actions are irreversible. Please proceed with caution.</p>
            <div className="flex flex-col gap-3">
              <button className="px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left flex items-center gap-3">
                <Download className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-700">Download My Data</p>
                  <p className="text-sm text-red-600">Download a copy of all your personal data</p>
                </div>
              </button>
              <button className="px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-700">Delete My Account</p>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="sticky bottom-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}