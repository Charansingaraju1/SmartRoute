// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeacherPassengersPage } from './TeacherPassengersPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: {
    getTeacherBuses: vi.fn(),
    getTeacherBusStudents: vi.fn(),
    deleteTeacherAssignment: vi.fn(),
  },
}));

vi.mock('@/components/ui/Toaster', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

const mockBuses = [
  {
    id: 'bus-1',
    registrationNumber: 'TS08UK2801',
    busNumber: 'Bus 28',
    active: true,
    capacity: 50,
    currentStudentsCount: 30,
    route: {
      routeCode: 'R-28',
      direction: 'MORNING',
    },
  },
];

const mockStudents = [
  {
    id: 'student-1',
    assignmentId: 'asg-1',
    studentId: '24EG105V14',
    user: { name: 'Sai Charan', email: 'saicharan@anurag.edu' },
    branch: 'CSE',
    classSection: 'A',
    assignmentStatus: 'ACTIVE',
    boardingPoint: {
      stopName: 'Sairam Theater',
      stopTime: '07:30',
    },
  },
];

describe('TeacherPassengersPage Functional Tests', () => {
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
        <TeacherPassengersPage />
      </QueryClientProvider>
    );

  it('renders bus list and expands passenger table with Remove action', async () => {
    vi.mocked(api.getTeacherBuses).mockResolvedValue(mockBuses);
    vi.mocked(api.getTeacherBusStudents).mockResolvedValue(mockStudents);
    vi.mocked(api.deleteTeacherAssignment).mockResolvedValue({ id: 'asg-1', status: 'CANCELLED' });

    renderComponent();

    expect(await screen.findByText('Passenger Lists')).toBeInTheDocument();
    expect(screen.getByText('TS08UK2801')).toBeInTheDocument();

    // Expand the bus row
    const expandBtn = screen.getByRole('button', { name: /expand passenger list/i });
    fireEvent.click(expandBtn);

    // Verify passenger details
    expect(await screen.findByText('Sai Charan')).toBeInTheDocument();
    expect(screen.getByText('24EG105V14')).toBeInTheDocument();
    expect(screen.getByText('Sairam Theater')).toBeInTheDocument();

    // Click Remove button
    const removeBtn = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeBtn);

    // Check confirmation dialog
    expect(await screen.findByText('Remove Student from Bus?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /confirm remove/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.deleteTeacherAssignment).toHaveBeenCalledWith('asg-1', 'Removed via Passenger List');
    });
  });
});
