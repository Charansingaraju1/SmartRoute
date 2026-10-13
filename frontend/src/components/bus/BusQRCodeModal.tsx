import { useState } from 'react';
import { X, QrCode, Copy, Check, ExternalLink, Bus as BusIcon, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

interface BusQRCodeModalProps {
  bus: {
    id: string;
    registrationNumber: string;
    busNumber?: string;
    driverName?: string;
    capacity: number;
    route?: {
      routeCode: string;
      routeName: string;
    };
  };
  onClose: () => void;
}

export function BusQRCodeModal({ bus, onClose }: BusQRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const qrData = `SMARTROUTE:BUS:${bus.registrationNumber}`;

  // SVG QR Code representation using an SVG pattern generator or standard QR service fallback
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData)}&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bus.registrationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-500/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#182235] rounded-2xl shadow-xl border border-stone-200 dark:border-slate-700 max-w-sm w-full overflow-hidden text-center">
        {/* Header */}
        <div className="bg-charcoal-500 dark:bg-[#111827] text-white p-4 flex items-center justify-between border-b dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BusIcon className="w-5 h-5 text-terracotta-500 dark:text-blue-400" />
            <h3 className="font-heading font-bold text-sm text-white">Official Vehicle QR</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-charcoal-600 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Verified Anurag Fleet
            </div>
            <h4 className="font-heading font-bold text-xl text-charcoal-500 dark:text-slate-100">
              {bus.busNumber || 'University Bus'}
            </h4>
            <p className="font-mono text-sm font-semibold text-stone-600 dark:text-slate-300">
              {bus.registrationNumber}
            </p>
            {bus.route && (
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                {bus.route.routeCode} · {bus.route.routeName}
              </p>
            )}
          </div>

          {/* QR Code Container */}
          <div className="bg-stone-50 dark:bg-[#111827] p-4 rounded-xl border border-stone-200 dark:border-slate-700 inline-block shadow-inner">
            <img 
              src={qrImageUrl} 
              alt={`QR Code for ${bus.registrationNumber}`} 
              className="w-48 h-48 mx-auto rounded-lg object-contain bg-white p-2 border border-stone-100 dark:border-slate-600"
              onError={(e) => {
                // If offline or external API blocked, show fallback styling
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <p className="font-mono text-[10px] text-stone-400 dark:text-slate-400 mt-2 tracking-wider">
              {bus.registrationNumber}
            </p>
          </div>

          {/* Helper info */}
          <p className="text-xs text-stone-500 dark:text-slate-400">
            This QR code can be scanned by students and staff using the SmartRoute Bus Scanner to verify this vehicle.
          </p>

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            <Button 
              onClick={handleCopy} 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Plate Number Copied!' : 'Copy Vehicle Code'}
            </Button>

            <Link 
              to={`/scan`} 
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-terracotta-50 text-terracotta-700 hover:bg-terracotta-100 border border-terracotta-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/60 dark:hover:bg-blue-900/40 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-terracotta-600 dark:text-blue-400" />
              Test In Bus Scanner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
