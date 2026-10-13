import { BusQRScanner } from '@/components/bus/BusQRScanner';
import { ShieldCheck, Bus, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BusQRScannerPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#121214] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-100 dark:bg-stone-800 text-terracotta-800 dark:text-stone-200 text-xs font-semibold mb-2 border border-terracotta-200/40 dark:border-stone-700">
            <ShieldCheck className="w-4 h-4 text-terracotta-600 dark:text-stone-300" />
            Official Vehicle Verification
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal-500 dark:text-[#F4F4F6]">
            Anurag University Bus Scanner
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-slate-300 max-w-xl mx-auto">
            Scan any official AU transport bus QR code or enter the vehicle plate number to verify registration, driver identity, route details, and available seats.
          </p>
        </div>

        {/* Scanner Component */}
        <BusQRScanner />

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-white dark:bg-[#182235] p-4 rounded-xl border border-stone-200 dark:border-slate-700 text-center">
            <div className="w-10 h-10 rounded-lg bg-terracotta-50 dark:bg-blue-950/50 text-terracotta-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-charcoal-500 dark:text-slate-100 text-sm">Fleet Authentication</h3>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Ensures only verified university transport buses are boarded.</p>
          </div>

          <div className="bg-white dark:bg-[#182235] p-4 rounded-xl border border-stone-200 dark:border-slate-700 text-center">
            <div className="w-10 h-10 rounded-lg bg-terracotta-50 dark:bg-blue-950/50 text-terracotta-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-charcoal-500 dark:text-slate-100 text-sm">Route & Stops</h3>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Instant view of assigned route codes, boarding stops, and arrival times.</p>
          </div>

          <div className="bg-white dark:bg-[#182235] p-4 rounded-xl border border-stone-200 dark:border-slate-700 text-center">
            <div className="w-10 h-10 rounded-lg bg-terracotta-50 dark:bg-blue-950/50 text-terracotta-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-charcoal-500 dark:text-slate-100 text-sm">Crew & Capacity</h3>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Quick access to driver and conductor contact numbers and live seat count.</p>
          </div>
        </div>

        {/* Footer Navigation helper */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-stone-500 dark:text-slate-400 pt-2">
          <Link to="/buses" className="hover:text-terracotta-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
            <Bus className="w-3.5 h-3.5" /> View Fleet
          </Link>
          <span>·</span>
          <Link to="/routes" className="hover:text-terracotta-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> All Routes
          </Link>
          <span>·</span>
          <Link to="/timings" className="hover:text-terracotta-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Timings
          </Link>
        </div>
      </div>
    </div>
  );
}
