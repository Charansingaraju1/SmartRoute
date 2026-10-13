import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GraduationCap, Users, Bus, MapPin, Plus, Search, Filter, ChevronDown, ChevronUp, Edit, Trash2, Shield, AlertCircle, X, Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toaster';

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

export function TeacherAssignmentsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED'>('all');
  const [busFilter, setBusFilter] = useState<string>('all');
  const [expandedAssignments, setExpandedAssignments] = useState<Set<string>>(new Set());

  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  // Form states for New / Edit
  const [formData, setFormData] = useState({
    studentId: '',
    busId: '',
    routeId: '',
    boardingPointId: '',
    direction: 'BOTH',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    assignmentNotes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: () => api.getTeacherAssignments(),
  });

  const { data: eligibleStudents } = useQuery({
    queryKey: ['teacher-eligible-students'],
    queryFn: () => api.getTeacherStudents(),
    enabled: showNewModal,
  });

  const { data: teacherBuses } = useQuery({
    queryKey: ['teacher-buses'],
    queryFn: () => api.getTeacherBuses(),
    enabled: showNewModal || editingAssignment !== null,
  });

  const { data: routes } = useQuery({
    queryKey: ['all-routes'],
    queryFn: () => api.getRoutes(),
    enabled: showNewModal || editingAssignment !== null,
  });

  const { data: stops } = useQuery({
    queryKey: ['route-stops', formData.routeId],
    queryFn: () => api.getStops(formData.routeId),
    enabled: !!formData.routeId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createTeacherAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-buses'] });
      addToast({ type: 'success', title: 'Assignment Created', message: 'Student bus assignment successfully created.' });
      closeModal();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create assignment';
      setFormError(msg);
      addToast({ type: 'error', title: 'Creation Failed', message: msg });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateTeacherAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-buses'] });
      addToast({ type: 'success', title: 'Assignment Updated', message: 'Assignment details updated successfully.' });
      closeModal();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update assignment';
      setFormError(msg);
      addToast({ type: 'error', title: 'Update Failed', message: msg });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTeacherAssignment(id, 'Removed by teacher'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-buses'] });
      addToast({ type: 'success', title: 'Assignment Removed', message: 'Student removed and seat capacity released.' });
      setAssignmentToDelete(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to remove assignment';
      addToast({ type: 'error', title: 'Removal Failed', message: msg });
    },
  });

  const closeModal = () => {
    setShowNewModal(false);
    setEditingAssignment(null);
    setFormError(null);
    setFormData({
      studentId: '',
      busId: '',
      routeId: '',
      boardingPointId: '',
      direction: 'BOTH',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      assignmentNotes: '',
    });
  };

  const handleOpenNew = () => {
    setFormError(null);
    setEditingAssignment(null);
    setFormData({
      studentId: '',
      busId: '',
      routeId: '',
      boardingPointId: '',
      direction: 'BOTH',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      assignmentNotes: '',
    });
    setShowNewModal(true);
  };

  const handleOpenEdit = (assignment: Assignment) => {
    setFormError(null);
    setEditingAssignment(assignment);
    setFormData({
      studentId: assignment.student.id,
      busId: assignment.bus.id,
      routeId: assignment.route.id,
      boardingPointId: assignment.boardingPoint?.id || '',
      direction: assignment.direction || 'BOTH',
      startDate: assignment.startDate || new Date().toISOString().slice(0, 10),
      endDate: assignment.endDate || '',
      assignmentNotes: assignment.assignmentNotes || '',
    });
    setShowNewModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.studentId && !editingAssignment) {
      setFormError('Please select a student.');
      return;
    }
    if (!formData.busId) {
      setFormError('Please select a bus.');
      return;
    }
    if (!formData.routeId) {
      setFormError('Please select a route.');
      return;
    }

    if (editingAssignment) {
      updateMutation.mutate({
        id: editingAssignment.id,
        data: {
          busId: formData.busId,
          routeId: formData.routeId,
          boardingPointId: formData.boardingPointId || undefined,
          direction: formData.direction,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          assignmentNotes: formData.assignmentNotes,
        },
      });
    } else {
      createMutation.mutate({
        studentId: formData.studentId,
        busId: formData.busId,
        routeId: formData.routeId,
        boardingPointId: formData.boardingPointId || undefined,
        direction: formData.direction,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        assignmentNotes: formData.assignmentNotes,
      });
    }
  };

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
          <h1 className="font-heading text-3xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">Bus Assignments</h1>
          <p className="text-stone-600 dark:text-slate-400 mt-1">Manage student-bus-route assignments and capacity.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2"
        >
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
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
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
            className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
          >
            <option value="all">All Buses</option>
            {buses.map(bus => (
              <option key={bus.id} value={bus.id}>Bus {bus.registrationNumber}</option>
            ))}
          </select>
        </div>
      </Card>

      {assignmentsData.length === 0 ? (
        <Card className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No assignments found</h3>
          <p className="text-stone-500 mb-4">Click below to create the first assignment.</p>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2 mx-auto"
          >
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
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{assignment.student.user.name}</p>
                            <p className="text-xs text-stone-500 dark:text-slate-400">{assignment.student.studentId || 'No ID'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant={assignment.status === 'ACTIVE' ? 'success' : assignment.status === 'PENDING' ? 'warning' : 'default'} size="sm">
                            {assignment.status}
                          </Badge>
                          <Badge variant="secondary" size="sm">Bus {assignment.bus.registrationNumber}</Badge>
                          <Badge variant={assignment.route.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                            {assignment.route.direction === 'MORNING' ? 'Morning' : 'Evening'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-slate-400">
                        <span className="font-mono text-sm text-charcoal-500 dark:text-[#F1F5F9]">Route {assignment.route.routeCode}</span>
                        {assignment.boardingPoint && (
                          <span className="flex items-center gap-1 text-stone-500 dark:text-slate-400">
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
                      className="p-2 rounded-lg text-stone-500 hover:text-charcoal-500 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-200 dark:border-[#334155] animate-slide-down">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                        <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Student</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{assignment.student.user.name}</p>
                            <p className="text-sm text-stone-500 dark:text-slate-400">{assignment.student.user.email}</p>
                            {assignment.student.studentId && <p className="text-xs text-stone-500 dark:text-slate-400 font-mono">{assignment.student.studentId}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                        <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Bus</p>
                        <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{assignment.bus.registrationNumber}</p>
                        <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">{assignment.bus.route?.routeCode || 'No route'}</p>
                      </div>
                      <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                        <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Route</p>
                        <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{assignment.route.routeCode}</p>
                        <Badge variant={assignment.route.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                          {assignment.route.direction === 'MORNING' ? 'Morning' : 'Evening'}
                        </Badge>
                      </div>
                      <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                        <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Boarding Point</p>
                        <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{assignment.boardingPoint?.stopName || 'Not assigned'}</p>
                        {assignment.boardingPoint?.stopTime && <p className="text-sm text-stone-500 dark:text-slate-400 mt-1 font-mono">{assignment.boardingPoint.stopTime}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                        <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Assignment Details</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-stone-500 dark:text-slate-400">Status</span>
                            <Badge variant={assignment.status === 'ACTIVE' ? 'success' : assignment.status === 'PENDING' ? 'warning' : 'default'} size="sm">
                              {assignment.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500 dark:text-slate-400">Direction</span>
                            <Badge variant={assignment.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                              {assignment.direction === 'MORNING' ? 'Morning' : 'Evening'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500 dark:text-slate-400">Start Date</span>
                            <span className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{assignment.startDate}</span>
                          </div>
                          {assignment.endDate && (
                            <div className="flex justify-between">
                              <span className="text-stone-500 dark:text-slate-400">End Date</span>
                              <span className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{assignment.endDate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                        <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Capacity Impact</p>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 dark:text-slate-400">Current Load</span>
                          <span className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{assignment.bus.currentStudentsCount}/{assignment.bus.capacity}</span>
                        </div>
                      </div>
                    </div>

                    {assignment.assignmentNotes && (
                      <div className="mt-4 p-4 bg-stone-50 dark:bg-[#111827] rounded-lg border border-stone-200 dark:border-slate-800">
                        <p className="text-xs text-stone-500 dark:text-slate-400 font-medium mb-1">Notes</p>
                        <p className="text-stone-700 dark:text-slate-300">{assignment.assignmentNotes}</p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleOpenEdit(assignment)}
                        className="px-4 py-2 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => setAssignmentToDelete(assignment)}
                        className="px-4 py-2 border border-red-300 dark:border-rose-800 text-red-600 dark:text-rose-400 rounded-lg hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors text-sm font-medium flex items-center gap-2"
                      >
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

      {/* New / Edit Assignment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#182235] border border-stone-200 dark:border-[#334155] rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-slate-700 mb-4">
              <h2 className="font-heading text-xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">
                {editingAssignment ? 'Edit Bus Assignment' : 'New Bus Assignment'}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {!editingAssignment ? (
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Student *</label>
                  <select
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9]"
                    required
                  >
                    <option value="">Select student</option>
                    {(eligibleStudents || []).map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.user?.name || s.name} ({s.studentId || 'No ID'}) - {s.user?.email}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-stone-100 dark:bg-slate-800 rounded-lg text-sm">
                  <span className="text-stone-500 dark:text-slate-400">Student: </span>
                  <strong className="text-charcoal-500 dark:text-white">{editingAssignment.student.user.name}</strong> ({editingAssignment.student.studentId || 'No ID'})
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Bus *</label>
                  <select
                    value={formData.busId}
                    onChange={e => setFormData({ ...formData, busId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9]"
                    required
                  >
                    <option value="">Select bus</option>
                    {(teacherBuses || []).map((b: any) => (
                      <option key={b.id} value={b.id}>
                        Bus {b.registrationNumber} ({b.currentStudentsCount ?? 0}/{b.capacity ?? 50} seats)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Route *</label>
                  <select
                    value={formData.routeId}
                    onChange={e => setFormData({ ...formData, routeId: e.target.value, boardingPointId: '' })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9]"
                    required
                  >
                    <option value="">Select route</option>
                    {(routes || []).map((r: any) => (
                      <option key={r.id} value={r.id}>
                        Route {r.routeCode} - {r.routeName || r.startingPoint || ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Boarding Point</label>
                  <select
                    value={formData.boardingPointId}
                    onChange={e => setFormData({ ...formData, boardingPointId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9]"
                    disabled={!formData.routeId}
                  >
                    <option value="">Select boarding stop (optional)</option>
                    {(stops || []).map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.stopName} {s.stopTime ? `(${s.stopTime})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Direction</label>
                  <select
                    value={formData.direction}
                    onChange={e => setFormData({ ...formData, direction: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9]"
                  >
                    <option value="BOTH">Both (Morning & Evening)</option>
                    <option value="MORNING">Morning Only</option>
                    <option value="EVENING">Evening Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formData.assignmentNotes}
                  onChange={e => setFormData({ ...formData, assignmentNotes: e.target.value })}
                  placeholder="Additional assignment remarks..."
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium border border-stone-300 dark:border-slate-700 rounded-lg text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 text-sm font-medium bg-terracotta-500 text-white rounded-lg hover:bg-terracotta-600 transition-colors flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingAssignment ? 'Save Changes' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Remove Confirmation Modal */}
      {assignmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#182235] border border-stone-200 dark:border-[#334155] rounded-xl max-w-md w-full p-6 shadow-xl animate-scale-in">
            <h3 className="font-heading text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9] mb-2">
              Remove Student Assignment?
            </h3>
            <p className="text-sm text-stone-600 dark:text-slate-300 mb-4">
              Are you sure you want to remove <strong className="text-charcoal-500 dark:text-white">{assignmentToDelete.student.user.name}</strong> from Bus <strong className="text-charcoal-500 dark:text-white">{assignmentToDelete.bus.registrationNumber}</strong>? This cancels their transport allocation and releases 1 seat on this bus. The student's account is NOT deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setAssignmentToDelete(null)}
                className="px-4 py-2 text-sm font-medium border border-stone-300 dark:border-slate-700 rounded-lg text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(assignmentToDelete.id)}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}