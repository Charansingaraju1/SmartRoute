import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bell, Mail, Bell as BellIcon, Check, CheckCheck, Clock, Filter, X, Loader2, AlertTriangle, AlertCircle, ArrowRight, Truck, GraduationCap, MapPin } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Notification {
  id: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  sentAt?: string;
  createdAt: string;
  priority: number;
}

interface NotificationsResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  BUS_ASSIGNMENT: Truck,
  ROUTE_CHANGE: Truck,
  STOP_CHANGE: MapPin,
  DELAY: Clock,
  DISRUPTION: AlertTriangle,
  MISSED_BUS: AlertTriangle,
  SOS: AlertCircle,
  PAYMENT_STATUS: Mail,
  ANNOUNCEMENT: Bell,
  THREE_STOPS_AWAY: Clock,
  MORNING_TRANSPORT: Truck,
  EVENING_TRANSPORT: Truck,
  BUS_PASS_UPDATE: GraduationCap,
  CAPACITY_CHANGE: Truck,
};

const notificationColors: Record<string, string> = {
  BUS_ASSIGNMENT: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  ROUTE_CHANGE: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  STOP_CHANGE: 'bg-green-100 text-green-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  DELAY: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  DISRUPTION: 'bg-red-100 text-red-800 dark:bg-rose-950/60 dark:text-rose-300',
  MISSED_BUS: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  SOS: 'bg-red-100 text-red-800 dark:bg-rose-950/60 dark:text-rose-300',
  PAYMENT_STATUS: 'bg-green-100 text-green-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  ANNOUNCEMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
  THREE_STOPS_AWAY: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
  MORNING_TRANSPORT: 'bg-yellow-100 text-yellow-800 dark:bg-amber-950/60 dark:text-amber-300',
  EVENING_TRANSPORT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
  BUS_PASS_UPDATE: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
  CAPACITY_CHANGE: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
};

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherNotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: notificationsData, isLoading, error } = useQuery({
    queryKey: ['teacher-notifications', page, size, filterRead],
    queryFn: () => api.getTeacherNotifications(page, size),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.markNotificationAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return api.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-notifications'] });
      setSelectedIds([]);
    },
  });

  const notifications = notificationsData?.content || [];
  const totalElements = notificationsData?.totalElements || 0;
  const totalPages = notificationsData?.totalPages || 0;
  const unreadCount = notifications.filter((n: { read: boolean; id: string }) => !n.read).length;

  const filteredNotifications = notifications.filter((n: { read: boolean; id: string }) => {
    if (filterRead === 'read') return n.read;
    if (filterRead === 'unread') return !n.read;
    return true;
  });

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-3/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-stone-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load notifications</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n: { id: string }) => n.id));
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-500">Notifications</h1>
          <p className="text-stone-600 mt-1">Stay updated with transport alerts and announcements.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="px-4 py-2 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="bg-stone-50 border-stone-200">
          <div className="p-4 text-center">
            <p className="font-heading text-2xl font-bold text-charcoal-500">{totalElements}</p>
            <p className="text-xs text-stone-500">Total</p>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="p-4 text-center">
            <p className="font-heading text-2xl font-bold text-red-600">{unreadCount}</p>
            <p className="text-xs text-red-700">Unread</p>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="p-4 text-center">
            <p className="font-heading text-2xl font-bold text-green-600">{totalElements - unreadCount}</p>
            <p className="text-xs text-green-700">Read</p>
          </div>
        </Card>
        <Card className="bg-stone-100 border-stone-200 dark:bg-stone-800/80 dark:border-stone-700">
          <div className="p-4 text-center">
            <p className="font-heading text-2xl font-bold text-stone-800 dark:text-stone-200">{selectedIds.length}</p>
            <p className="text-xs text-stone-600 dark:text-stone-400">Selected</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'unread', 'read'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilterRead(tab as 'all' | 'read' | 'unread')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filterRead === tab
                ? 'bg-terracotta-500 text-stone-50'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-stone-200 text-stone-600">
                {tab === 'unread' ? unreadCount : totalElements - unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="h-16 w-16 text-stone-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">
            {filterRead === 'unread' ? 'No unread notifications' : 'No notifications'}
          </h3>
          <p className="text-stone-500">
            {filterRead === 'unread' ? 'You\'re all caught up!' : 'No notifications yet. They\'ll appear here when you receive them.'}
          </p>
        </Card>
      ) : (
        <>
          {selectedIds.length > 0 && (
            <div className="mb-4 p-3 bg-terracotta-50 dark:bg-amber-950/40 border border-terracotta-200 dark:border-amber-800/60 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-terracotta-700 dark:text-amber-300">{selectedIds.length} notifications selected</span>
              <button
                onClick={() => {
                  selectedIds.forEach(id => handleMarkAsRead(id));
                  setSelectedIds([]);
                }}
                className="px-3 py-1.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors"
              >
                Mark as Read
              </button>
            </div>
          )}

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-stone-500 dark:text-slate-400 border-b border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-[#111827]">
                    <th className="p-3 font-medium w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-stone-300 dark:border-slate-700 text-terracotta-500 focus:ring-terracotta-500 dark:bg-slate-900"
                      />
                    </th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Message</th>
                    <th className="p-3 font-medium w-32">Time</th>
                    <th className="p-3 font-medium w-24">Status</th>
                    <th className="p-3 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notification: { id: string; type: string; title: string; message: string; read: boolean; createdAt: string; actionUrl?: string; relatedEntityType?: string }) => {
                    const Icon = notificationIcons[notification.type] || Bell;
                    const colorClass = notificationColors[notification.type] || 'bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-300';
                    const row = (
                      <tr
                        key={notification.id}
                        className={cn(
                          'border-b border-stone-100 dark:border-slate-800 last:border-0 transition-colors',
                          !notification.read && 'bg-stone-50/50 dark:bg-slate-800/30',
                          selectedIds.includes(notification.id) && 'bg-terracotta-50 dark:bg-amber-950/30'
                        )}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(notification.id)}
                            onChange={() => handleToggleSelect(notification.id)}
                            className="w-4 h-4 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                          />
                        </td>
                        <td className="p-3">
                          <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', colorClass)}>
                            <Icon className="h-3 w-3 inline mr-1" />
                            {notification.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-charcoal-500 max-w-xs truncate">{notification.title}</td>
                        <td className="p-3 text-stone-600 max-w-md truncate">{notification.message}</td>
                        <td className="p-3 text-sm text-stone-500 whitespace-nowrap">
                          {notification.createdAt ? formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true }) : '—'}
                        </td>
                        <td className="p-3">
                          <Badge variant={notification.read ? 'default' : 'primary'} size="sm">
                            {notification.read ? 'Read' : 'Unread'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            {notification.actionUrl && (
                              <a
                                href={notification.actionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
                                title="View details"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-stone-500">
                  Showing {(page * size) + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} notifications
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 0}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}