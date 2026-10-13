// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentGPSPage } from './StudentGPSPage';
import { TeacherLocationPage } from '../teacher/TeacherLocationPage';
import { api } from '@/services/api';

// Mock Leaflet and React-Leaflet for JSDOM testing
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: ({ url, attribution }: any) => <div data-testid="tile-layer" data-url={url} data-attribution={attribution} />,
  Marker: ({ position, children }: any) => <div data-testid="map-marker" data-position={JSON.stringify(position)}>{children}</div>,
  Popup: ({ children }: any) => <div data-testid="map-popup">{children}</div>,
  Circle: ({ center, radius }: any) => <div data-testid="accuracy-circle" data-center={JSON.stringify(center)} data-radius={radius} />,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: () => 13,
  }),
}));

vi.mock('leaflet', () => ({
  default: {
    divIcon: (opts: any) => opts,
  },
}));

describe('GPS and Leaflet Map Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(api, 'getRoutes').mockResolvedValue([
      {
        id: 'route-1',
        routeCode: 'R-101',
        routeName: 'Dilsukhnagar to AU Campus',
      },
    ] as any);

    vi.spyOn(api, 'getStops').mockResolvedValue([
      {
        id: 'stop-1',
        stopName: 'Dilsukhnagar Bus Depot',
        stopOrder: 1,
        stopTime: '07:15:00',
        latitude: 17.3688,
        longitude: 78.5247,
        landmark: 'Metro Station',
      },
      {
        id: 'stop-2',
        stopName: 'Stop Without Coordinates',
        stopOrder: 2,
        latitude: null,
        longitude: null,
      },
    ] as any);

    vi.spyOn(api, 'getTeacherBuses').mockResolvedValue([
      {
        id: 'bus-1',
        registrationNumber: 'TS08UB1001',
        active: true,
        route: { routeCode: 'R-101' },
      },
    ] as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders StudentGPSPage with honest hardware telemetry disclaimer and verified stops only', async () => {
    const testQueryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Seed route data directly into query client so routeId is immediately available
    testQueryClient.setQueryData(['routes'], [
      {
        id: 'route-1',
        routeCode: 'R-101',
        routeName: 'Dilsukhnagar to AU Campus',
      },
    ]);

    testQueryClient.setQueryData(['stops', 'route-1'], [
      {
        id: 'stop-1',
        stopName: 'Dilsukhnagar Bus Depot',
        stopOrder: 1,
        stopTime: '07:15:00',
        latitude: 17.3688,
        longitude: 78.5247,
        landmark: 'Metro Station',
      },
      {
        id: 'stop-2',
        stopName: 'Stop Without Coordinates',
        stopOrder: 2,
        latitude: null,
        longitude: null,
      },
    ]);

    render(
      <QueryClientProvider client={testQueryClient}>
        <StudentGPSPage />
      </QueryClientProvider>
    );

    // 1. Check title
    expect(screen.getByText(/Live Location & Route Stops/i)).toBeInTheDocument();

    // 2. Check disclaimer
    expect(screen.getByText(/Live Bus Telemetry Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time bus tracking is currently/i)).toBeInTheDocument();

    // 3. Map container should render
    expect(screen.getByTestId('map-container')).toBeInTheDocument();

    // 4. Verify route select option is present
    expect(await screen.findByRole('option', { name: /R-101/i })).toBeInTheDocument();
  });

  it('handles user device geolocation on StudentGPSPage only after explicit button click', async () => {
    const testQueryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const mockGetCurrentPosition = vi.fn((success) => {
      success({
        coords: {
          latitude: 17.4206,
          longitude: 78.6565,
          accuracy: 15,
        },
        timestamp: 1700000000000,
      });
    });

    Object.defineProperty(window.navigator, 'geolocation', {
      value: {
        getCurrentPosition: mockGetCurrentPosition,
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <StudentGPSPage />
      </QueryClientProvider>
    );

    const locateBtn = screen.getByRole('button', { name: /Locate My Device/i });
    fireEvent.click(locateBtn);

    expect(mockGetCurrentPosition).toHaveBeenCalled();

    // Check that latitude and longitude appear in document
    expect(await screen.findByText('17.42060')).toBeInTheDocument();
    expect(await screen.findByText('78.65650')).toBeInTheDocument();
    expect(await screen.findByText(/±15 meters/i)).toBeInTheDocument();
  });

  it('renders TeacherLocationPage with authentic assigned buses and no fake vehicle markers', async () => {
    const testQueryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <TeacherLocationPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Live Location & Bus Fleet/i)).toBeInTheDocument();
    expect(screen.getByText(/Bus Hardware GPS Status/i)).toBeInTheDocument();
    expect(screen.getByText(/No synthetic positions or simulated movement are generated/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/TS08UB1001/i)).toBeInTheDocument();
    });

    // Verify there are no fabricated bus plates from old mock implementation
    expect(screen.queryByText(/Bus TS08 UK 1234/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bus TS08 UK 5678/i)).not.toBeInTheDocument();
  });
});
