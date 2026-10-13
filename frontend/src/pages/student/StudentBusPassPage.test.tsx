// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { StudentBusPassPage, canonicalPassNumber } from './StudentBusPassPage';
import { api } from '@/services/api';

describe('StudentBusPassPage Regression Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('canonicalPassNumber Helper', () => {
    it('normalizes ASS- and FASS- prefixes to canonical PASS-', () => {
      expect(canonicalPassNumber('ASS-31849762')).toBe('PASS-31849762');
      expect(canonicalPassNumber('FASS-31849762')).toBe('PASS-31849762');
      expect(canonicalPassNumber('PASS-31849762')).toBe('PASS-31849762');
      expect(canonicalPassNumber('BUS-PASS-31849762')).toBe('PASS-31849762');
      expect(canonicalPassNumber('31849762')).toBe('PASS-31849762');
      expect(canonicalPassNumber(undefined)).toBe('PASS-PENDING');
      expect(canonicalPassNumber(null)).toBe('PASS-PENDING');
    });
  });

  describe('Pending Verification State & Assignment Isolation', () => {
    it('displays pending review banner, uncertain route status, canonical pass number, and separates active route 39', async () => {
      // Mock student profile with active Route 39
      vi.spyOn(api, 'getStudentProfile').mockResolvedValue({
        id: 'student-1',
        rollNumber: '24EG105V14',
        name: 'SINGARAJU N R SAI CHARAN',
        route: {
          id: 'route-39',
          routeCode: 'R-39',
          routeName: 'Suchithra to College',
        },
        bus: {
          id: 'bus-39',
          busNumber: 'Bus 39',
          registrationNumber: 'TS08UK3904',
          driverName: 'Ramesh K',
          driverPhone: '9848012345',
        },
      } as any);

      // Mock unverified pass with uncertain route and ASS- prefix
      vi.spyOn(api, 'getStudentBusPass').mockResolvedValue({
        id: 'pass-rec-1',
        passNumber: 'ASS-31849762', // Document OCR glitch
        status: 'PENDING_VERIFICATION',
        verified: false,
        academicYear: '2026-27',
        route: null, // Uncertain / not found
        bus: null,
        boardingPoint: null,
        studentAssignedRoute: {
          id: 'route-39',
          routeCode: 'R-39',
          routeName: 'Suchithra to College',
        },
        studentAssignedBus: {
          id: 'bus-39',
          busNumber: 'Bus 39',
          registrationNumber: 'TS08UK3904',
        },
        ocrExtractedData:
          'Pass Number: PASS-31849762\nAcademic Year: 2026-27\nDetected Route: Uncertain / Not Found\nBoarding Stop: Pending Stop Match\nVerification State: PENDING_COORDINATOR_REVIEW',
      } as any);

      renderWithProviders(<StudentBusPassPage />);

      // 1. Check canonical pass number
      await waitFor(() => {
        expect(screen.getByText('PASS-31849762')).toBeInTheDocument();
      });
      // Ensure raw malformed ASS-31849762 is NOT rendered as the pass badge
      expect(screen.queryByText('ASS-31849762')).not.toBeInTheDocument();

      // 2. Check Pending Coordinator Review Banner
      const pendingBanner = document.getElementById('pass-pending-banner');
      expect(pendingBanner).toBeInTheDocument();
      expect(screen.getByText(/Pass Verification Pending Transport Review/i)).toBeInTheDocument();

      // 3. Document route card must NOT show Route 39 as the recognized route
      expect(screen.getByText(/Uncertain \/ Pending Verification/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending Coordinator Allocation/i)).toBeInTheDocument();
      expect(screen.queryByText(/Confirmed Allocation/i)).not.toBeInTheDocument();

      // 4. Student's existing Route 39 assignment is preserved and displayed separately
      const activeCard = document.getElementById('current-active-assignment-card');
      expect(activeCard).toBeInTheDocument();
      expect(screen.getByText(/Currently Active Route Assignment/i)).toBeInTheDocument();
      expect(screen.getByText(/R-39 • Suchithra to College/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Bus: Bus 39 \(TS08UK3904\)/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Active transit remains in effect until new pass review is approved/i)
      ).toBeInTheDocument();
    });

    it('renders confirmed Route 28 when pass recognition has been verified and approved', async () => {
      vi.spyOn(api, 'getStudentProfile').mockResolvedValue({
        id: 'student-1',
        rollNumber: '24EG105V14',
        name: 'SINGARAJU N R SAI CHARAN',
        route: {
          id: 'route-28',
          routeCode: 'R-28',
          routeName: 'Sairam Theater to College',
        },
        bus: {
          id: 'bus-28',
          busNumber: 'Bus 28',
          registrationNumber: 'TS08UK2801',
        },
      } as any);

      vi.spyOn(api, 'getStudentBusPass').mockResolvedValue({
        id: 'pass-rec-2',
        passNumber: 'PASS-31849762',
        status: 'ACTIVE',
        verified: true,
        academicYear: '2026-27',
        route: {
          id: 'route-28',
          routeCode: 'R-28',
          routeName: 'Sairam Theater to College',
        },
        bus: {
          id: 'bus-28',
          busNumber: 'Bus 28',
          registrationNumber: 'TS08UK2801',
        },
        boardingPoint: {
          id: 'stop-sairam',
          stopName: 'SAIRAM THEATER',
          stopTime: '07:35:00',
        },
        ocrExtractedData: 'Detected Route: R-28 - Sairam Theater to College\nAssigned Bus: Bus 28 (TS08UK2801)',
      } as any);

      renderWithProviders(<StudentBusPassPage />);

      await waitFor(() => {
        expect(screen.getByText('PASS-31849762')).toBeInTheDocument();
      });

      // No pending review banner should be present
      expect(document.getElementById('pass-pending-banner')).not.toBeInTheDocument();

      // Verified badges and allocations
      expect(screen.getByText('R-28')).toBeInTheDocument();
      expect(screen.getByText('Sairam Theater to College')).toBeInTheDocument();
      expect(screen.getAllByText(/Bus 28 \(TS08UK2801\)/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/SAIRAM THEATER/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });
});
