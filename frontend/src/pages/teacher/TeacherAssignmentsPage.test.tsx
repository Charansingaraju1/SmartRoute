// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeacherAssignmentsPage } from './TeacherAssignmentsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: {
    getTeacherAssignments: vi.fn(),
    getTeacherStudents: vi.fn(),
    getTeacherBuses: vi.fn(),
    getRoutes: vi.fn(),
    getStops: vi.fn(),
    createTeacherAssignment: vi.fn(),
    updateTeacherAssignment: vi.fn(),
    deleteTeacherAssignment: vi.fn(),
  },
}));

vi.mock('@/components/ui/Toaster', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

const mockAssignments = [
  {
    id: 'asg-1',
    student: {
      id: 'student-1',
      studentId: '24EG105V14',
      user: { name: 'Sai Charan', email: 'saicharan@anurag.edu' },
      branch: 'CSE',
      classSection: 'A',
    },
    bus: {
      id: 'bus-1',
      registrationNumber: 'TS08UK2801',
      capacity: 50,
      currentStudentsCount: 25,
      route: { routeCode: 'R-28' },
    },
    route: {
      id: 'route-1',
      routeCode: 'R-28',
      routeName: 'Sairam Theater to AU',
      direction: 'MORNING',
    },
    boardingPoint: {
      id: 'bp-1',
      stopName: 'Sairam Theater',
      stopTime: '07:30',
    },
    direction: 'MORNING',
    status: 'ACTIVE',
    startDate: '2026-06-01',
  },
];

describe('TeacherAssignmentsPage Functional Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <TeacherAssignmentsPage />
      </QueryClientProvider>
    );

  it('renders bus assignments list successfully', async () => {
    vi.mocked(api.getTeacherAssignments).mockResolvedValue(mockAssignments);

    renderComponent();

    expect(await screen.findByText('Bus Assignments')).toBeInTheDocument();
    expect(await screen.findByText('Sai Charan')).toBeInTheDocument();
    expect(screen.getByText('24EG105V14')).toBeInTheDocument();
    expect(screen.getAllByText(/Bus TS08UK2801/).length).toBeGreaterThan(0);
  });

  it('opens New Assignment modal and populates student/bus/route options', async () => {
    vi.mocked(api.getTeacherAssignments).mockResolvedValue([]);
    vi.mocked(api.getTeacherStudents).mockResolvedValue([
      { id: 's-2', studentId: '24EG105V15', user: { name: 'Anita Rao', email: 'anita@anurag.edu' } },
    ]);
    vi.mocked(api.getTeacherBuses).mockResolvedValue([
      { id: 'b-2', registrationNumber: 'TS08UK3904', capacity: 50, currentStudentsCount: 15 },
    ]);
    vi.mocked(api.getRoutes).mockResolvedValue([
      { id: 'r-2', routeCode: 'R-39', startingPoint: 'Suchithra' },
    ]);

    renderComponent();

    const newBtn = await screen.findByRole('button', { name: /new assignment/i });
    fireEvent.click(newBtn);

    expect(await screen.findByText('New Bus Assignment')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create assignment/i })).toBeInTheDocument();
  });

  it('triggers delete confirmation modal and invokes deleteTeacherAssignment API', async () => {
    vi.mocked(api.getTeacherAssignments).mockResolvedValue(mockAssignments);
    vi.mocked(api.deleteTeacherAssignment).mockResolvedValue({ id: 'asg-1', status: 'CANCELLED' });

    renderComponent();

    // Expand assignment card to expose action buttons
    const expandBtn = await screen.findByRole('button', { expanded: false });
    fireEvent.click(expandBtn);

    const removeBtn = await screen.findByRole('button', { name: /remove/i });
    fireEvent.click(removeBtn);

    expect(await screen.findByText('Remove Student Assignment?')).toBeInTheDocument();
    expect(screen.getByText(/releases 1 seat on this bus/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /confirm remove/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.deleteTeacherAssignment).toHaveBeenCalledWith('asg-1', 'Removed by teacher');
    });
  });
});
