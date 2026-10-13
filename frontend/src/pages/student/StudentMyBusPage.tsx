import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Bus,
  MapPin,
  Clock,
  User,
  Shield,
  QrCode,
  AlertTriangle,
  FileText,
  Navigation,
  CheckCircle,
  GraduationCap,
  Calendar,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BusQRCodeModal } from '@/components/bus/BusQRCodeModal';
import { LeafletMap, StopCoordinate } from '@/components/map/LeafletMap';
import { formatBusNumber, formatRouteCode } from '@/utils/transport';
import { canonicalPassNumber } from '@/pages/student/StudentBusPassPage';

export function StudentMyBusPage() {
  const [showQR, setShowQR] = useState(false);

  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ['student-assignment'],
    queryFn: () => api.getStudentAssignment(),
  });

  const { data: busPass } = useQuery({
    queryKey: ['student-bus-pass'],
    queryFn: () => api.getStudentBusPass().catch(() => null),
  });

  const bus = assignment?.bus;
  const route = assignment?.route;
  const boardingPoint = assignment?.boardingPoint;

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 dark:bg-charcoal-700 rounded w-3/4"></div>
          <div className="h-64 bg-stone-200 dark:bg-charcoal-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="container-app py-12">
        <Card className="max-w-2xl mx-auto text-center py-12" padding="lg">
          <Bus className="h-16 w-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-semibold text-charcoal-500 dark:text-stone-100 mb-2">No Bus Assigned</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
            You don't currently have an active bus assigned. Upload your official college bus pass for automatic verification or browse university transportation routes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/student/bus-pass"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Upload Bus Pass
            </Link>
            <Link
              to="/routes"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-charcoal-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-charcoal-600 rounded-lg text-sm font-medium transition-colors border border-stone-200 dark:border-charcoal-600"
            >
              <Navigation className="h-4 w-4 text-terracotta-500" />
              Browse University Routes
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Format bus and route display identifiers
  const displayBusName = formatBusNumber(bus);
  const displayRouteTitle = formatRouteCode(route);

  // Prepare map stops along actual road route
  const mapStops: StopCoordinate[] = (route?.boardingPoints || [])
    .filter((bp: any) => bp.latitude && bp.longitude)
    .sort((a: any, b: any) => (a.stopOrder || 0) - (b.stopOrder || 0))
    .map((bp: any) => ({
      id: bp.id,
      name: bp.stopName,
      description: bp.stopDescription,
      order: bp.stopOrder,
      time: bp.stopTime,
      lat: parseFloat(bp.latitude),
      lng: parseFloat(bp.longitude),
      landmark: bp.landmark,
      isCollege: bp.stopName?.toLowerCase().includes('campus') || bp.stopName?.toLowerCase().includes('university'),
    }));

  const destinationCollege = route?.endingPoint || 'Anurag University Campus';
  const startingPoint = route?.startingPoint || (mapStops.length > 0 ? mapStops[0].name : 'Starting Point');
  const userBoardingStopName = boardingPoint?.stopName || (mapStops.length > 0 ? mapStops[0].name : undefined);
  const userBoardingTime = boardingPoint?.stopTime || 'Scheduled Pickup';

  return (
    <div className="container-app py-8">
      {/* Header and Alert Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-bold text-charcoal-500 dark:text-stone-100">{displayBusName}</h1>
            <Badge variant={bus.active ? 'success' : 'danger'}>{bus.active ? 'Active Fleet' : 'Inactive'}</Badge>
            <span className="text-xs px-2.5 py-1 font-mono rounded bg-stone-100 dark:bg-charcoal-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-charcoal-600">
              Vehicle {bus.registrationNumber}
            </span>
          </div>
          <p className="text-stone-600 dark:text-stone-400 mt-1 flex items-center gap-2">
            <span>{displayRouteTitle}</span>
            <span>•</span>
            <span className="text-terracotta-600 dark:text-terracotta-400 font-medium">Destination: {destinationCollege}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/missed-bus"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-lg text-sm transition-colors shadow-sm"
            id="btn-missed-bus"
          >
            <AlertTriangle className="w-4 h-4 text-stone-900" />
            I Missed My Bus
          </Link>
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-terracotta-50 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-charcoal-600 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-terracotta-500" /> Show Bus QR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details and Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real Interactive Street Road Map */}
          <Card padding="none" className="overflow-hidden border border-stone-200 dark:border-charcoal-700 shadow-sm">
            <div className="p-4 bg-stone-50 dark:bg-charcoal-800/80 border-b border-stone-200 dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-terracotta-500" />
                <h3 className="font-heading text-sm font-semibold text-charcoal-500 dark:text-stone-100">
                  Actual Road Navigation Route
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Boarding Stop: {userBoardingStopName}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-700"></span> {destinationCollege}
                </span>
              </div>
            </div>

            <div className="h-[420px] w-full relative">
              <LeafletMap
                stops={mapStops}
                busNumber={displayBusName}
                routeName={displayRouteTitle}
                selectedBoardingStopName={userBoardingStopName}
                collegeDestination={{
                  name: destinationCollege,
                  lat: 17.4206,
                  lng: 78.6565,
                }}
                height="420px"
              />
            </div>
            <div className="p-3 bg-stone-50 dark:bg-charcoal-800 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between border-t border-stone-200 dark:border-charcoal-700">
              <span>Street route connected via live OSRM navigation following real road curves and junctions.</span>
              <span className="font-medium text-stone-700 dark:text-stone-300">Total Stops: {mapStops.length}</span>
            </div>
          </Card>

          {/* Assigned Boarding Point & Journey Card */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-stone-100 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-terracotta-500" />
                Your Assigned Boarding Details
              </h3>
              {boardingPoint && (
                <Badge variant="info">Stop #{boardingPoint.stopOrder}</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-50 dark:bg-charcoal-700/50 p-4 rounded-xl border border-stone-200 dark:border-charcoal-600">
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Boarding Stop</p>
                <p className="font-heading text-lg font-bold text-charcoal-500 dark:text-stone-100">
                  {userBoardingStopName || 'Not Assigned'}
                </p>
                {boardingPoint?.landmark && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Landmark: {boardingPoint.landmark}</p>
                )}
              </div>

              <div className="bg-stone-50 dark:bg-charcoal-700/50 p-4 rounded-xl border border-stone-200 dark:border-charcoal-600">
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Scheduled Pickup</p>
                <p className="font-mono text-lg font-bold text-terracotta-600 dark:text-terracotta-400">
                  {userBoardingTime}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Departure: {route?.startingTime || '07:15 AM'}</p>
              </div>

              <div className="bg-stone-50 dark:bg-charcoal-700/50 p-4 rounded-xl border border-stone-200 dark:border-charcoal-600">
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Destination Campus</p>
                <p className="font-heading text-lg font-bold text-charcoal-500 dark:text-stone-100 flex items-center gap-1.5">
                  <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  {destinationCollege}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Arrival: {route?.endingTime || '08:45 AM'}</p>
              </div>
            </div>
          </Card>

          {/* Full Sequenced Stops Table */}
          {route?.boardingPoints && route.boardingPoints.length > 0 && (
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-stone-100 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-terracotta-500" />
                  Complete Route Stop Sequence ({route.boardingPoints.length} stops)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-charcoal-700">
                      <th className="pb-3 font-medium w-12">#</th>
                      <th className="pb-3 font-medium">Stop Name</th>
                      <th className="pb-3 font-medium">Scheduled Time</th>
                      <th className="pb-3 font-medium">Status / Tag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {route.boardingPoints
                      .sort((a: any, b: any) => (a.stopOrder || 0) - (b.stopOrder || 0))
                      .map((stop: any) => {
                        const isUserStop = stop.id === boardingPoint?.id || stop.stopName === userBoardingStopName;
                        const isDestination = stop.stopName?.toLowerCase().includes('campus') || stop.stopName?.toLowerCase().includes('university');

                        return (
                          <tr
                            key={stop.id}
                            className={`border-b border-stone-100 dark:border-charcoal-700/60 transition-colors ${
                              isUserStop
                                ? 'bg-blue-50/80 dark:bg-blue-950/30'
                                : isDestination
                                ? 'bg-amber-50/60 dark:bg-amber-950/20'
                                : 'hover:bg-stone-50/60 dark:hover:bg-charcoal-700/30'
                            }`}
                          >
                            <td className="py-3 text-stone-500 dark:text-stone-400 font-mono">{stop.stopOrder}</td>
                            <td className="py-3 font-medium text-charcoal-500 dark:text-stone-200">
                              {stop.stopName}
                              {stop.landmark && (
                                <span className="block text-xs text-stone-400 dark:text-stone-500 font-normal">
                                  {stop.landmark}
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-stone-600 dark:text-stone-400 font-mono">
                              {stop.stopTime || '—'}
                            </td>
                            <td className="py-3">
                              {isUserStop && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                  <CheckCircle className="w-3 h-3" /> Your Boarding Stop
                                </span>
                              )}
                              {isDestination && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                                  <GraduationCap className="w-3 h-3" /> Destination College
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Vehicle & Crew Card */}
          <Card padding="lg">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-stone-100 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-terracotta-500" />
              Assigned Vehicle & Crew
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bus.driverName ? (
                <div className="bg-stone-50 dark:bg-charcoal-700/50 rounded-lg p-4 border border-stone-200 dark:border-charcoal-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-terracotta-100 dark:bg-terracotta-900/50 flex items-center justify-center">
                      <User className="h-5 w-5 text-terracotta-600 dark:text-terracotta-400" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Driver</p>
                      <p className="font-medium text-charcoal-500 dark:text-stone-200">{bus.driverName}</p>
                      {bus.driverPhone && (
                        <a href={`tel:${bus.driverPhone}`} className="text-xs text-terracotta-600 dark:text-terracotta-400 hover:underline">
                          {bus.driverPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {bus.conductorName ? (
                <div className="bg-stone-50 dark:bg-charcoal-700/50 rounded-lg p-4 border border-stone-200 dark:border-charcoal-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Conductor</p>
                      <p className="font-medium text-charcoal-500 dark:text-stone-200">{bus.conductorName}</p>
                      {bus.conductorPhone && (
                        <a href={`tel:${bus.conductorPhone}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                          {bus.conductorPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-200 dark:border-charcoal-700">
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Capacity</p>
                <p className="font-heading text-lg font-bold text-charcoal-500 dark:text-stone-200">
                  {bus.currentStudentsCount} / {bus.capacity}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Seats Left</p>
                <p className="font-heading text-lg font-bold text-terracotta-600 dark:text-terracotta-400">
                  {bus.availableCapacity} seats
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Direction</p>
                <p className="text-sm font-medium text-charcoal-500 dark:text-stone-200">
                  {route?.direction === 'MORNING' ? 'To College' : 'Return Home'}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Est. Duration</p>
                <p className="text-sm font-medium text-charcoal-500 dark:text-stone-200">
                  {route?.estimatedDurationMinutes || 85} mins
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Info & Pass Status */}
        <div className="space-y-6">
          {/* Bus Pass Validity Card */}
          <Card padding="lg">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-stone-100 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-terracotta-500" />
              Bus Pass Status
            </h3>

            {busPass ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500 dark:text-stone-400">Pass Number:</span>
                  <span className="font-mono text-xs font-semibold text-charcoal-500 dark:text-stone-200">
                    {canonicalPassNumber(busPass.passNumber) || 'PASS-ACTIVE'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500 dark:text-stone-400">Status:</span>
                  <Badge variant={busPass.status === 'ACTIVE' ? 'success' : busPass.status === 'PENDING_VERIFICATION' ? 'warning' : 'danger'}>
                    {busPass.status === 'PENDING_VERIFICATION' ? 'PENDING VERIFICATION' : busPass.status}
                  </Badge>
                </div>
                {busPass.validUntil && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 dark:text-stone-400">Valid Until:</span>
                    <span className="text-xs font-medium text-charcoal-500 dark:text-stone-300">
                      {busPass.validUntil}
                    </span>
                  </div>
                )}
                <div className="pt-2">
                  <Link
                    to="/student/bus-pass"
                    className="block text-center py-2 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-200 transition-colors"
                  >
                    View Bus Pass Card
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">No verified pass document linked.</p>
                <Link
                  to="/student/bus-pass"
                  className="inline-block py-2 px-3 bg-terracotta-500 text-stone-50 rounded-lg text-xs font-semibold hover:bg-terracotta-400 transition-colors"
                >
                  Upload Bus Pass
                </Link>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card padding="lg">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-stone-100 mb-4">
              Student Navigation
            </h3>
            <div className="space-y-3">
              <Link to="/student/missed-bus" className="block">
                <button className="w-full text-left p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-500 dark:text-stone-200 text-sm">I Missed My Bus</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Request backup or alternative bus</p>
                    </div>
                  </div>
                </button>
              </Link>

              <Link to="/student/my-route" className="block">
                <button className="w-full text-left p-3.5 rounded-lg border border-stone-200 dark:border-charcoal-600 hover:border-terracotta-300 dark:hover:border-terracotta-600 hover:bg-terracotta-50/50 dark:hover:bg-charcoal-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                      <Navigation className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-500 dark:text-stone-200 text-sm">Full Route & Stops</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">View timetable and intermediate stops</p>
                    </div>
                  </div>
                </button>
              </Link>

              <Link to="/student/boarding-point" className="block">
                <button className="w-full text-left p-3.5 rounded-lg border border-stone-200 dark:border-charcoal-600 hover:border-terracotta-300 dark:hover:border-terracotta-600 hover:bg-terracotta-50/50 dark:hover:bg-charcoal-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-500 dark:text-stone-200 text-sm">My Boarding Point</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Change stop or check pickup time</p>
                    </div>
                  </div>
                </button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {showQR && bus && (
        <BusQRCodeModal bus={bus} onClose={() => setShowQR(false)} />
      )}
    </div>
  );
}