import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, MapPin, Users, Clock, Search, Filter, ChevronDown, QrCode } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Bus as BusType } from '@/types/transport';
import { BusQRCodeModal } from '@/components/bus/BusQRCodeModal';

export function BusInfoPage() {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [selectedBusForQR, setSelectedBusForQR] = useState<any | null>(null);

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const data = await api.getBuses();
      setBuses(data);
      setFilteredBuses(data);
    } catch (err) {
      setError('Failed to load buses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = buses;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(bus => 
        bus.registrationNumber.toLowerCase().includes(term) ||
        bus.busNumber?.toLowerCase().includes(term) ||
        bus.driverName?.toLowerCase().includes(term) ||
        bus.route?.routeName?.toLowerCase().includes(term)
      );
    }
    setFilteredBuses(result);
  }, [search, buses]);

  if (loading) {
    return (
      <div className="container-app py-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse-subtle flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500/20">
            <Bus className="h-6 w-6 text-terracotta-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal-500 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium mb-4">
              <span>←</span> Back to Home
            </Link>
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-500 dark:text-slate-100 mb-2">Bus Information</h1>
            <p className="text-lg text-stone-600 dark:text-slate-300">View all active university buses with routes, capacity, and driver details.</p>
          </div>
          <Link to="/scan">
            <Button variant="primary" className="flex items-center gap-2 shadow-sm">
              <QrCode className="w-4 h-4" /> Scan Bus QR
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6" padding="md">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search by registration, bus number, driver, route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-900 placeholder:text-stone-400 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
              />
            </div>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100 dark:focus:border-blue-400"
            >
              <option value="all">All Zones</option>
              <option value="dsnr">DSNR Zone</option>
              <option value="ramanthapur">Ramanthapur Zone</option>
              <option value="uppal">Uppal Zone</option>
              <option value="secunderabad">Secunderabad Zone</option>
              <option value="ecil">ECIL Zone</option>
              <option value="bhongir">Bhongir Zone</option>
            </select>
          </div>
        </Card>

        {/* Results */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
            {error}
            <Button variant="ghost" size="sm" className="ml-4" onClick={loadBuses}>Retry</Button>
          </div>
        )}

        {filteredBuses.length === 0 ? (
          <Card className="text-center py-12">
            <Bus className="h-12 w-12 text-stone-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-medium text-charcoal-500 dark:text-slate-100 mb-2">No buses found</h3>
            <p className="text-stone-500 dark:text-slate-400">Try adjusting your search or filters.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuses.map((bus) => (
              <Card key={bus.id} className="h-full" padding="md">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-lg font-bold text-charcoal-500 dark:text-slate-100">{bus.registrationNumber}</span>
                      {bus.busNumber && (
                        <Badge variant="secondary" size="sm">{bus.busNumber}</Badge>
                      )}
                    </div>
                    {bus.route && (
                      <p className="text-sm text-stone-500 dark:text-slate-400">
                        {bus.route.routeName} ({bus.route.routeCode})
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={bus.active ? 'success' : 'danger'} 
                    dot 
                    dotColor={bus.active ? '#16A34A' : '#DC2626'}
                  >
                    {bus.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-stone-500 dark:text-slate-400">Capacity</p>
                      <p className="font-medium text-charcoal-500 dark:text-slate-200">{bus.capacity} seats</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 dark:text-slate-400">Available</p>
                      <p className="font-medium text-green-600 dark:text-emerald-400">{bus.availableCapacity} seats</p>
                    </div>
                  </div>
                  {bus.driverName && (
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-slate-300">
                      <Users className="h-4 w-4" />
                      <span>Driver: {bus.driverName}</span>
                    </div>
                  )}
                  {bus.conductorName && (
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-slate-300">
                      <Users className="h-4 w-4" />
                      <span>Conductor: {bus.conductorName}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedBusForQR(bus)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-terracotta-600 bg-stone-100 hover:bg-terracotta-50 px-2.5 py-1.5 rounded-lg transition-colors dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                  >
                    <QrCode className="w-3.5 h-3.5 text-terracotta-500 dark:text-blue-400" /> View QR
                  </button>

                  {bus.route ? (
                    <Link
                      to={`/routes/${bus.route.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Route <span>→</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-stone-400 dark:text-slate-500">Campus Loop</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedBusForQR && (
          <BusQRCodeModal
            bus={selectedBusForQR}
            onClose={() => setSelectedBusForQR(null)}
          />
        )}
      </div>
    </div>
  );
}