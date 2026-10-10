import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GraduationCap, Users, Bus, MapPin, Plus, Search, Filter, ChevronDown, ChevronUp, Edit, Trash2, Shield, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Assignment {
  id: string;
  student: {
    id: string;
    user: { name: string; email: string };
    studentId?: string;
    branch?: string;
    classSection?: string;
  };
  bus: {
    id: string;
    registrationNumber: string;
    capacity: number;
    currentStudentsCount: number;
    route?: { routeCode: string; routeName?: string };
  };
  route: {
    id: string;
    routeCode: string;
    routeName?: string;
    direction: string;
  };
  boardingPoint?: { id: string; stopName: string; stopTime?: string };
  direction: string;
  status: string;
  startDate: string;
  endDate?: string;
  assignedBy?: string;
  assignmentNotes?: string;
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherAssignmentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED'>('all');
  const [busFilter, setBusFilter] = useState<string>('all');
  const [expandedAssignments, setExpandedAssignments] = useState<Set<string>>(new Set());
  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: () => api.getTeacherAssignments(),
  });

  const assignmentsData = assignments || [];
  const filteredAssignments = assignmentsData.filter(assignment => {
    if (search && !assignment.student.user.name.toLowerCase().includes(search.toLowerCase()) &&
        !assignment.student.studentId?.toLowerCase().includes(search.toLowerCase()) &&
        !assignment.bus.registrationNumber.toLowerCase().includes(search.toLowerCase()) &&
        !assignment.route.routeCode.toLowerCase().includes(search.toLowerCase()) &&
        !assignment.student.user.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && assignment.status !== statusFilter) return false;
    if (busFilter !== 'all' && assignment.bus.id !== busFilter) return false;
    return true;
  });
  const buses = [...new Map(assignmentsData.map(a => [a.bus.id, a.bus])).values()];
  const toggleExpand = (assignmentId: string) => {
    setExpandedAssignments(prev => {
      const next = new Set(prev);
      if (next.has(assignmentId)) next.delete(assignmentId);
      else next.add(assignmentId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-3/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-stone-200 rounded-xl"></div>
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
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load assignments</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-500">Bus Assignments</h1>
          <p className="text-stone-600 mt-1">Manage student-bus-route assignments.</p>
        </div>
        <button className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Assignment
        </button>
      </div>

      <Card className="mb-6" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by student name, email, student ID, bus, route..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-900 placeholder:text-stone-400 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={busFilter}
            onChange={e => setBusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none"
          >
            <option value="all">All Buses</option>
            {buses.map(bus => (
              <option key={bus.id} value={bus.id}>Bus {bus.registrationNumber}</option>
            ))}
          </select>
        </div>
      </Card>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {assignmentsData.length === 0 ? (
        <Card className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No assignments found</h3>
          <p className="text-stone-500 mb-4">Try adjusting your search or filters.</p>
          <button className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            Create First Assignment
          </button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map(assignment => {
            const isExpanded = expandedAssignments.has(assignment.id);
            return (
              <Card key={assignment.id} className="overflow-hidden" padding="md">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-500">{assignment.student.user.name}</p>
                            <p className="text-xs text-stone-500">{assignment.student.studentId || 'No ID'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.status === 'ACTIVE' ? 'success' : assignment.status === 'PENDING' ? 'warning' : 'default'} size="sm">
                            {assignment.status}
                          </Badge>
                          <Badge variant="secondary" size="sm">Bus {assignment.bus.registrationNumber}</Badge>
                          <Badge variant={assignment.route.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                            {assignment.route.direction === 'MORNING' ? 'Morning' : 'Evening'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <span className="font-mono text-sm text-charcoal-500">Route {assignment.route.routeCode}</span>
                        {assignment.boardingPoint && (
                          <span className="flex items-center gap-1 text-stone-500">
                            <MapPin className="h-3 w-3" />
                            {assignment.boardingPoint.stopName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleExpand(assignment.id)}
                      className="p-2 rounded-lg text-stone-500 hover:text-charcoal-500 hover:bg-stone-100 transition-colors"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-200 animate-slide-down">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                        <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Student</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-500">{assignment.student.user.name}</p>
                            <p className="text-sm text-stone-500">{assignment.student.user.email}</p>
                            {assignment.student.studentId && <p className="text-xs text-stone-500 font-mono">{assignment.student.studentId}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                        <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Bus</p>
                        <p className="font-mono text-lg font-bold text-charcoal-500">{assignment.bus.registrationNumber}</p>
                        <p className="text-sm text-stone-500 mt-1">{assignment.bus.route?.routeCode || 'No route'}</p>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                        <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Route</p>
                        <p className="font-mono text-lg font-bold text-charcoal-500">{assignment.route.routeCode}</p>
                        <Badge variant={assignment.route.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                          {assignment.route.direction === 'MORNING' ? 'Morning' : 'Evening'}
                        </Badge>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                        <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Boarding Point</p>
                        <p className="font-medium text-charcoal-500">{assignment.boardingPoint?.stopName || 'Not assigned'}</p>
                        {assignment.boardingPoint?.stopTime && <p className="text-sm text-stone-500 mt-1 font-mono">{assignment.boardingPoint.stopTime}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                        <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Assignment Details</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-stone-500">Status</span>
                            <Badge variant={assignment.status === 'ACTIVE' ? 'success' : assignment.status === 'PENDING' ? 'warning' : 'default'} size="sm">
                              {assignment.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Direction</span>
                            <Badge variant={assignment.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                              {assignment.direction === 'MORNING' ? 'Morning' : 'Evening'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Start Date</span>
                            <span className="font-medium text-charcoal-500">{assignment.startDate}</span>
                          </div>
                          {assignment.endDate && (
                            <div className="flex justify-between">
                              <span className="text-stone-500">End Date</span>
                              <span className="font-medium text-charcoal-500">{assignment.endDate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                        <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Capacity Impact</p>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500">Current Load</span>
                          <span className="font-mono text-lg font-bold text-charcoal-500">{assignment.bus.currentStudentsCount}/{assignment.bus.capacity}</span>
                        </div>
                      </div>
                    </div>

                    {assignment.assignmentNotes && (
                      <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                        <p className="text-xs text-stone-500 font-medium mb-1">Notes</p>
                        <p className="text-stone-700">{assignment.assignmentNotes}</p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button className="px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors text-sm font-medium flex items-center gap-2">
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button className="px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors text-sm font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Verify
                      </button>
                      <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-2">
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}