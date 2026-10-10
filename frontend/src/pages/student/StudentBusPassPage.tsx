import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Clock, Map, ArrowRight, ChevronDown, ChevronUp, Bus, GraduationCap, Image, QrCode, FileText, CheckCircle, XCircle, Camera, Eye, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, parseISO } from 'date-fns';

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

interface BusPass {
  id: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'PENDING_VERIFICATION' | 'REJECTED';
  validFrom: string;
  validUntil?: string;
  passNumber?: string;
  imageUrl?: string;
  qrCodeData?: string;
  ocrExtractedData?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  rejectionReason?: string;
  academicYear?: string;
  feePaid: boolean;
  feeAmount?: number;
  paymentRecordId?: string;
  bus?: { id: string; registrationNumber: string; route?: { routeCode: string; routeName?: string } };
  route?: { id: string; routeCode: string; routeName?: string };
}

export function StudentBusPassPage() {
  const { data: busPass, isLoading, error } = useQuery({
    queryKey: ['student-bus-pass'],
    queryFn: () => api.getStudentBusPass(),
  });
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  if (error) {
    return (
      <div className="container-app py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load bus pass</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  const pass = busPass;

  const statusVariant = {
    ACTIVE: 'success',
    PENDING_VERIFICATION: 'warning',
    REJECTED: 'danger',
    EXPIRED: 'default',
    REVOKED: 'danger',
  } as const;

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-500">Bus Pass</h1>
          <p className="text-stone-600 mt-1">Manage your digital bus pass and verification status.</p>
        </div>
        {pass?.status === 'PENDING_VERIFICATION' || !pass ? (
          <button onClick={() => setShowUpload(true)} className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2">
            <Camera className="h-4 w-4" />
            {pass ? 'Update Pass' : 'Upload Pass'}
          </button>
        ) : (
          <button onClick={() => setShowUpload(true)} className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Update Pass
          </button>
        )}
      </div>

      {showUpload && (
        <Card className="mb-8" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500">Upload Bus Pass</h3>
            <button onClick={() => { setShowUpload(false); setPreviewUrl(null); }} className="p-2 text-stone-500 hover:text-stone-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={async e => {
            e.preventDefault();
            // TODO: Implement upload
            alert('Upload functionality would be implemented here');
          }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">Upload Bus Pass Image</label>
              <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="bus-pass-upload"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setPreviewUrl(URL.createObjectURL(file));
                  }}
                />
                <label htmlFor="bus-pass-upload" className="cursor-pointer">
                  <Image className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-stone-400 mt-1">PNG, JPG up to 10MB</p>
                </label>
              </div>
              {previewUrl && (
                <div className="relative w-full max-w-md mx-auto">
                  <img src={previewUrl} alt="Preview" className="w-full rounded-lg border border-stone-200" />
                  <button type="button" onClick={() => setPreviewUrl(null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={!previewUrl} className="px-6 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 disabled:opacity-50">Upload Pass</button>
              <button type="button" onClick={() => { setShowUpload(false); setPreviewUrl(null); }} className="px-6 py-2.5 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-100">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {pass ? (
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <GraduationCap className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-charcoal-500">Digital Bus Pass</h2>
                    <p className="text-stone-500">Your verified university transport pass</p>
                  </div>
                </div>
                <Badge variant={statusVariant[pass.status as keyof typeof statusVariant] as 'success' | 'warning' | 'danger' | 'default'} size="sm">
                  {pass.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {pass.passNumber && (
                  <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Pass Number</p>
                    <p className="font-mono text-xl font-bold text-charcoal-500">{pass.passNumber}</p>
                  </div>
                )}
                {pass.academicYear && (
                  <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Academic Year</p>
                    <p className="font-medium text-charcoal-500">{pass.academicYear}</p>
                  </div>
                )}
                {pass.validFrom && (
                  <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Valid From</p>
                    <p className="font-medium text-charcoal-500">{pass.validFrom}</p>
                  </div>
                )}
                {pass.validUntil && (
                  <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Valid Until</p>
                    <p className="font-medium text-charcoal-500">{pass.validUntil}</p>
                  </div>
                )}
                {pass.route && (
                  <div className="col-span-2 bg-stone-50 rounded-xl p-6 border border-stone-200">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Assigned Route</p>
                    <p className="font-mono text-lg font-bold text-charcoal-500">{pass.route.routeCode}</p>
                    <p className="text-sm text-stone-500 mt-1">{pass.route.routeName}</p>
                  </div>
                )}
                {pass.bus && (
                  <div className="col-span-2 bg-stone-50 rounded-xl p-6 border border-stone-200">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Assigned Bus</p>
                    <p className="font-mono text-lg font-bold text-charcoal-500">{pass.bus.registrationNumber}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-center">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Fee Status</p>
                  <Badge variant={pass.feePaid ? 'success' : 'warning'} size="sm">
                    {pass.feePaid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-center">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Fee Amount</p>
                  <p className="font-mono text-lg font-bold text-terracotta-600">₹{pass.feeAmount || 0}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-center">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Verification</p>
                  <Badge variant={pass.verifiedAt ? 'success' : 'warning'} size="sm">
                    {pass.verifiedAt ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {pass.qrCodeData && (
                <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200 text-center">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">QR Code Data</p>
                  <div className="font-mono text-sm text-charcoal-500 break-all bg-white p-3 rounded border border-stone-200">{pass.qrCodeData}</div>
                </div>
              )}

              {pass.ocrExtractedData && (
                <div className="mt-6">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">OCR Extracted Information</p>
                  <div className="bg-white p-4 rounded-lg border border-stone-200 font-mono text-sm text-charcoal-500 overflow-auto max-h-60 whitespace-pre-wrap">
                    {pass.ocrExtractedData}
                  </div>
                  <p className="text-xs text-stone-500 mt-3 text-center">Review this data before saving. You can manually correct any errors.</p>
                </div>
              )}

              {pass.verifiedAt && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-700">Pass Verified</p>
                  </div>
                  <p className="text-sm text-green-800">Verified on {pass.verifiedAt}</p>
                  {pass.verificationNotes && <p className="text-sm text-green-700 mt-1">{pass.verificationNotes}</p>}
                </div>
              )}

              {pass.rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <p className="font-medium text-red-700">Pass Rejected</p>
                  </div>
                  <p className="text-red-800">{pass.rejectionReason}</p>
                </div>
              )}
            </Card>
          ) : (
            <Card className="text-center py-12" padding="lg">
              <GraduationCap className="h-16 w-16 text-stone-300 mx-auto mb-4" />
              <h2 className="font-heading text-xl font-semibold text-charcoal-500 mb-2">No Bus Pass Uploaded</h2>
              <p className="text-stone-500 mb-6">Upload your bus pass image to get it verified and access transport services.</p>
              <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors">
                <Camera className="h-4 w-4" />
                Upload Bus Pass
              </button>
            </Card>
          )}

          {pass?.ocrExtractedData && (
            <Card padding="lg">
              <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-terracotta-500" />
                OCR Extracted Information
              </h3>
              <div className="bg-white p-4 rounded-lg border border-stone-200 font-mono text-sm text-charcoal-500 overflow-auto max-h-60 whitespace-pre-wrap">
                {pass.ocrExtractedData}
              </div>
              <p className="text-xs text-stone-500 mt-3 text-center">Review this data before saving. You can manually correct any errors.</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card padding="lg" className="text-center">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4">Pass Features</h3>
            <div className="space-y-3">
              <a href="#" className="block">
                <button className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500">QR Code Scanner</p>
                      <p className="text-sm text-stone-500">Scan QR to verify pass</p>
                    </div>
                  </div>
                </button>
              </a>
              <a href="#" className="block">
                <button className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500">Verify Another Pass</p>
                      <p className="text-sm text-stone-500">For transport staff</p>
                    </div>
                  </div>
                </button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}