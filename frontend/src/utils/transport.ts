/**
 * Transport display helpers
 * Ensures simple, clear bus numbers ("Bus 1", "Bus 2", etc.)
 * separate from internal registration numbers and route codes.
 */

export function formatBusNumber(bus?: { busNumber?: string; registrationNumber?: string } | null): string {
  if (!bus) return 'Unassigned Bus';
  
  if (bus.busNumber && bus.busNumber.trim()) {
    const raw = bus.busNumber.trim();
    // Normalize "Bus 01" -> "Bus 1", "Bus 02" -> "Bus 2", etc.
    const match = raw.match(/^Bus\s*0*(\d+)$/i);
    if (match) {
      return `Bus ${match[1]}`;
    }
    return raw;
  }
  
  if (bus.registrationNumber && bus.registrationNumber.trim()) {
    return `Bus ${bus.registrationNumber.trim()}`;
  }
  
  return 'Assigned Bus';
}

export function formatRouteCode(route?: { routeCode?: string; routeName?: string } | null): string {
  if (!route) return 'Unassigned Route';
  if (route.routeCode && route.routeName) {
    return `${route.routeCode} • ${route.routeName}`;
  }
  return route.routeCode || route.routeName || 'Route';
}
