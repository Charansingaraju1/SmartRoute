import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Clock, Map, ArrowRight, ChevronDown, ChevronUp, Bus, GraduationCap, Image, QrCode, FileText, CheckCircle, XCircle, Camera, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, parseISO } from 'date-fns';
import React from 'react';

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

interface BoardingPointDetail {
  id: string;
  stopName: string;
  stopDescription?: string;
  stopOrder: number;
  stopTime?: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  active: boolean;
  route?: {
    id: string;
    routeCode: string;
    routeName?: string;
    direction: string;
    startingPoint?: string;
    startingTime?: string;
    boardingPoints?: Array<{ id: string; stopName: string; stopTime?: string; stopOrder: number }>;
  };
}

export function StudentBoardingPointPage() {
  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ['student-assignment'],
    queryFn: () => api.getStudentAssignment(),
  });

  const boardingPoint = assignment?.boardingPoint;
  const route = assignment?.route;
  const [expanded, setExpanded] = useState(false);

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

  if (error || !boardingPoint) {
    return (
      <div className="container-app py-12">
        <Card className="max-w-2xl mx-auto text-center py-12" padding="lg">
          <MapPin className="h-16 w-16 text-stone-300 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-charcoal-500 mb-2">No Boarding Point Assigned</h2>
          <p className="text-stone-500 mb-6">You don't have an assigned boarding point yet.</p>
          <Link to="/student/my-bus" className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors">
            View Available Buses
          </Link>
        </Card>
      </div>
    );
  }

  const hasStops = boardingPoint.route?.boardingPoints && boardingPoint.route.boardingPoints.length > 0;

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">My Boarding Point</h1>
        <p className="text-stone-600 mt-1">Your assigned pickup location, time, and route details.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                  <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-charcoal-500">{boardingPoint.stopName}</h2>
                  <p className="text-stone-500">Stop Order: #{boardingPoint.stopOrder}</p>
                </div>
              </div>
              <Badge variant={boardingPoint.active ? 'success' : 'danger'}>{boardingPoint.active ? 'Active' : 'Inactive'}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {boardingPoint.stopTime && (
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide">Pickup Time</p>
                      <p className="font-mono text-2xl font-bold text-charcoal-500">{boardingPoint.stopTime}</p>
                    </div>
                  </div>
                </div>
              )}
              {boardingPoint.landmark && (
                <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide">Landmark</p>
                      <p className="font-medium text-charcoal-500">{boardingPoint.landmark}</p>
                    </div>
                  </div>
                </div>
              )}
              {boardingPoint.stopDescription && (
                <div className="col-span-1 md:col-span-2 bg-stone-50 rounded-xl p-6 border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-stone-600">{boardingPoint.stopDescription}</p>
                </div>
              )}
              {boardingPoint.latitude && boardingPoint.longitude && (
                <div className="col-span-1 md:col-span-2 bg-stone-50 rounded-xl p-6 border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">GPS Coordinates</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-stone-200">
                      <p className="text-xs text-stone-500">Latitude</p>
                      <p className="font-mono text-lg font-medium text-charcoal-500">{boardingPoint.latitude}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-stone-200">
                      <p className="text-xs text-stone-500">Longitude</p>
                      <p className="font-mono text-lg font-medium text-charcoal-500">{boardingPoint.longitude}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-stone-200">
              <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-terracotta-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Route Context
              </h3>
              <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Assigned Route</p>
                <p className="font-mono text-lg font-bold text-charcoal-500">{route?.routeCode || 'Not assigned'}</p>
                <p className="text-sm text-stone-500 mt-1">{route?.routeName || 'Unnamed Route'}</p>
              </div>
            </div>
          </Card>

          {boardingPoint.route?.boardingPoints && boardingPoint.route.boardingPoints.length > 0 && (
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-lg font-semibold text-charcoal-500 flex items-center gap-2">
                  <svg className="h-5 w-5 text-terracotta-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                  All Stops on Route
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                      <th className="pb-2 font-medium w-12">#</th>
                      <th className="pb-2 font-medium">Stop Name</th>
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Landmark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardingPoint.route?.boardingPoints
                      ?.sort((a: { stopOrder: number }, b: { stopOrder: number }) => a.stopOrder - b.stopOrder)
                      .map((stop: { id: string; stopOrder: number; stopName: string; stopTime?: string; landmark?: string }) => (
                        <tr key={stop.id} className={cn('border-b border-stone-100 last:border-0', stop.id === boardingPoint.id && 'bg-terracotta-50')}>
                          <td className="py-3 text-stone-500 font-mono">{stop.stopOrder}</td>
                          <td className="py-3 font-medium text-charcoal-500">
                            {stop.stopName}
                            {stop.id === boardingPoint.id && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 bg-terracotta-100 text-terracotta-700 rounded">YOU</span>
                            )}
                          </td>
                          <td className="py-3 text-stone-600">
                            {stop.stopTime ? <span className="font-mono">{stop.stopTime}</span> : <span className="text-stone-400">—</span>}
                          </td>
                          <td className="py-3 text-stone-500">{stop.landmark || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

          <div className="space-y-4">
            <Card padding="lg" className="text-center">
              <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4">Related Pages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/student/my-route" className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500">View Full Route</p>
                      <p className="text-sm text-stone-500">All stops & timings</p>
                    </div>
                  </div>
                </Link>
                <Link to="/student/my-bus" className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-terracotta-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-terracotta-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500">My Bus Details</p>
                      <p className="text-sm text-stone-500">Bus info & driver</p>
                    </div>
                  </div>
                </Link>
                <Link to="/student/bus-pass" className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500">My Bus Pass</p>
                      <p className="text-sm text-stone-500">View & manage pass</p>
                    </div>
                  </div>
                </Link>
                <Link to="/student/gps" className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a5 5 0 1110 0 5 5 0 01-10 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500">Live Location</p>
                      <p className="text-sm text-stone-500">Track bus in real-time</p>
                    </div>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}