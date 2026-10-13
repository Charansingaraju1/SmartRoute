import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toaster';
import {
  MapPin,
  Clock,
  Navigation,
  ArrowRight,
  Bus,
  GraduationCap,
  Image,
  QrCode,
  FileText,
  CheckCircle,
  XCircle,
  Camera,
  Eye,
  AlertCircle,
  Upload,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { formatBusNumber, formatRouteCode } from '@/utils/transport';

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
  bus?: { id: string; registrationNumber: string; busNumber?: string; route?: { routeCode: string; routeName?: string } };
  route?: { id: string; routeCode: string; routeName?: string };
  studentAssignedBus?: { id: string; registrationNumber: string; busNumber?: string; route?: { routeCode: string; routeName?: string } };
  studentAssignedRoute?: { id: string; routeCode: string; routeName?: string };
}

export function canonicalPassNumber(passNo?: string | null): string {
  if (!passNo) return 'PASS-PENDING';
  const cleaned = passNo.trim().toUpperCase().replace(/^(?:(?:BUS[-_\s]*)?(?:P?ASS|FASS))[-_\s]*/, '');
  return `PASS-${cleaned}`;
}

export function StudentBusPassPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { data: busPass, isLoading, error } = useQuery({
    queryKey: ['student-bus-pass'],
    queryFn: () => api.getStudentBusPass(),
  });

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast({
        type: 'warning',
        title: 'No file selected',
        message: 'Please choose an image or PDF pass document to upload.',
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', selectedFile);
      const res = await api.postStudentBusPass(formData);

      await queryClient.invalidateQueries({ queryKey: ['student-bus-pass'] });
      await queryClient.invalidateQueries({ queryKey: ['student-assignment'] });

      setShowUpload(false);
      setSelectedFile(null);
      setPreviewUrl(null);

      const isAssigned = res?.bus || res?.status === 'ACTIVE';

      addToast({
        type: 'success',
        title: isAssigned ? 'Bus Pass Verified & Bus Assigned!' : 'Bus Pass Uploaded',
        message: isAssigned
          ? 'Automatic recognition verified your pass and assigned your eligible bus.'
          : 'Your bus pass has been uploaded and queued for coordinator verification.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.response?.data?.message || err.message || 'Failed to upload bus pass.',
      });
    } finally {
      setUploading(false);
    }
  };

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

  if (error) {
    return (
      <div className="container-app py-12 text-center">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl p-8 max-w-lg mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Unable to load bus pass</h2>
          <p className="text-red-600 dark:text-red-400 mb-6">Please try again later or contact transport office.</p>
        </div>
      </div>
    );
  }

  const pass = busPass;

  const isPendingReview = pass?.status === 'PENDING_VERIFICATION';
  const isVerified = pass?.status === 'ACTIVE';

  const statusVariant = {
    ACTIVE: 'success',
    PENDING_VERIFICATION: 'warning',
    REJECTED: 'danger',
    EXPIRED: 'default',
    REVOKED: 'danger',
  } as const;

  const badgeVariant = pass?.status ? (statusVariant[pass.status as keyof typeof statusVariant] || 'default') : 'warning';
  const statusText = isPendingReview ? 'PENDING COORDINATOR REVIEW' : (pass?.status ? pass.status.replace(/_/g, ' ') : 'NO PASS');

  const isPDF = selectedFile?.type === 'application/pdf' || selectedFile?.name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-500 dark:text-stone-100">Bus Pass Recognition</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1 text-base">
            Upload your university bus pass for automatic route recognition and vehicle assignment.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-5 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-semibold hover:bg-terracotta-400 transition-colors flex items-center gap-2 shadow-sm"
          id="btn-upload-pass"
        >
          <Upload className="h-4 w-4" />
          {pass ? 'Upload / Re-verify Pass' : 'Upload Bus Pass'}
        </button>
      </div>

      {showUpload && (
        <Card className="mb-8 border border-stone-200 dark:border-charcoal-700" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-terracotta-500" />
              <h3 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-stone-100">
                Automatic Bus Pass Recognition
              </h3>
            </div>
            <button
              onClick={() => { setShowUpload(false); setSelectedFile(null); setPreviewUrl(null); }}
              className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
            Upload a clear image or PDF of your university bus pass. SmartRoute will extract your name, registration number, route, and boarding stop to automatically assign your bus.
          </p>

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div>
              <div className="border-2 border-dashed border-stone-300 dark:border-charcoal-600 rounded-xl p-8 text-center hover:border-terracotta-400 hover:bg-terracotta-50/30 dark:hover:bg-charcoal-700/30 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg,application/pdf"
                  className="hidden"
                  id="bus-pass-upload"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      if (file.type.startsWith('image/')) {
                        setPreviewUrl(URL.createObjectURL(file));
                      } else {
                        setPreviewUrl(null);
                      }
                    }
                  }}
                />
                <label htmlFor="bus-pass-upload" className="cursor-pointer block">
                  <Upload className="h-12 w-12 text-terracotta-500 mx-auto mb-3" />
                  <p className="text-base text-stone-700 dark:text-stone-200 font-semibold">
                    Click to select file or drag & drop
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                    Accepts JPG, PNG, WEBP, or PDF documents up to 10MB
                  </p>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4 p-4 bg-stone-50 dark:bg-charcoal-700/60 rounded-xl border border-stone-200 dark:border-charcoal-600 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-terracotta-500" />
                    <div>
                      <p className="font-medium text-sm text-charcoal-500 dark:text-stone-200">{selectedFile.name}</p>
                      <p className="text-xs text-stone-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}

              {previewUrl && (
                <div className="relative w-full max-w-sm mx-auto mt-4">
                  <img src={previewUrl} alt="Document Preview" className="w-full rounded-lg border border-stone-200 dark:border-charcoal-600 shadow-sm" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="px-6 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-semibold hover:bg-terracotta-400 disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-50 border-t-transparent rounded-full animate-spin" />
                    <span>Extracting & Verifying...</span>
                  </>
                ) : (
                  <span>Recognize & Assign Bus</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setShowUpload(false); setSelectedFile(null); setPreviewUrl(null); }}
                className="px-5 py-2.5 border border-stone-300 dark:border-charcoal-600 text-stone-600 dark:text-stone-300 rounded-lg text-sm hover:bg-stone-100 dark:hover:bg-charcoal-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {pass ? (
            <Card padding="lg" className="border border-stone-200 dark:border-charcoal-700">
              {isPendingReview && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-3 text-amber-900 dark:text-amber-200" id="pass-pending-banner">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Pass Verification Pending Transport Review</p>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      Your uploaded university pass has been received and is queued for official coordinator verification.
                      {pass.studentAssignedRoute ? ' Your current transit assignment remains active in the interim.' : ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-stone-800 flex items-center justify-center">
                    <GraduationCap className="h-7 w-7 text-indigo-600 dark:text-stone-300" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-charcoal-500 dark:text-stone-100">Digital University Bus Pass</h2>
                    <p className="text-stone-500 dark:text-stone-400 text-sm">Verified Institutional Transport Credential</p>
                  </div>
                </div>
                <Badge variant={badgeVariant as 'success' | 'warning' | 'danger' | 'default'} size="sm">
                  {statusText}
                </Badge>
              </div>

              {pass.imageUrl && (
                <div className="mb-6 p-4 bg-stone-50 dark:bg-charcoal-800 rounded-xl border border-stone-200 dark:border-charcoal-700">
                  <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2 font-medium">Uploaded Pass Document</p>
                  <img
                    src={pass.imageUrl}
                    alt="Uploaded Bus Pass"
                    className="max-h-64 rounded-lg border border-stone-200 dark:border-charcoal-600 object-contain mx-auto"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {pass.passNumber && (
                  <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/60" id="pass-number-card">
                    <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Pass Number</p>
                    <p className="font-mono text-xl font-bold text-charcoal-500 dark:text-stone-100">{canonicalPassNumber(pass.passNumber)}</p>
                  </div>
                )}
                {pass.academicYear && (
                  <div className="bg-stone-50 dark:bg-charcoal-700/50 rounded-xl p-4 border border-stone-200 dark:border-charcoal-600">
                    <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Academic Year</p>
                    <p className="font-medium text-charcoal-500 dark:text-stone-100">{pass.academicYear}</p>
                  </div>
                )}
                {pass.validFrom && (
                  <div className="bg-stone-50 dark:bg-charcoal-700/50 rounded-xl p-4 border border-stone-200 dark:border-charcoal-600">
                    <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Valid From</p>
                    <p className="font-medium text-charcoal-500 dark:text-stone-100">{pass.validFrom}</p>
                  </div>
                )}
                {pass.validUntil && (
                  <div className="bg-stone-50 dark:bg-charcoal-700/50 rounded-xl p-4 border border-stone-200 dark:border-charcoal-600">
                    <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Valid Until</p>
                    <p className="font-medium text-charcoal-500 dark:text-stone-100">{pass.validUntil}</p>
                  </div>
                )}

                {/* Recognized / Document Route */}
                {pass.route ? (
                  <div className="col-span-2 bg-stone-50 dark:bg-charcoal-700/50 rounded-xl p-4 border border-stone-200 dark:border-charcoal-600" id="pass-recognized-route-card">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide font-medium">
                        {isVerified ? 'Verified Pass Route' : 'Detected Route on Document (Pending Review)'}
                      </p>
                      <Badge variant={isVerified ? 'success' : 'warning'} size="sm">
                        {isVerified ? 'Confirmed' : 'Unconfirmed / In Review'}
                      </Badge>
                    </div>
                    <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-stone-100">{pass.route.routeCode}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{pass.route.routeName}</p>
                  </div>
                ) : isPendingReview ? (
                  <div className="col-span-2 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-4 border border-dashed border-amber-300 dark:border-amber-800/60" id="pass-uncertain-route-card">
                    <p className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wide font-semibold mb-1">
                      Detected Route on Document
                    </p>
                    <p className="font-mono text-base font-bold text-charcoal-500 dark:text-stone-200">
                      Uncertain / Pending Verification
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Route code could not be reliably verified automatically. Official coordinator review required before route update.
                    </p>
                  </div>
                ) : null}

                {/* Assigned Vehicle */}
                {pass.bus && isVerified ? (
                  <div className="col-span-2 bg-stone-50 dark:bg-charcoal-700/50 rounded-xl p-4 border border-stone-200 dark:border-charcoal-600" id="pass-assigned-vehicle-card">
                    <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Assigned Vehicle</p>
                    <p className="font-heading text-lg font-bold text-terracotta-600 dark:text-terracotta-400">
                      {formatBusNumber(pass.bus)} ({pass.bus.registrationNumber})
                    </p>
                  </div>
                ) : isPendingReview ? (
                  <div className="col-span-2 bg-stone-50 dark:bg-charcoal-700/50 rounded-xl p-4 border border-dashed border-stone-300 dark:border-charcoal-600">
                    <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Vehicle Assignment</p>
                    <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Pending Coordinator Allocation</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Final vehicle assignment is confirmed upon pass verification.</p>
                  </div>
                ) : null}

                {/* Currently Active Assignment (distinguished clearly) */}
                {(pass.studentAssignedRoute || pass.studentAssignedBus) && (
                  <div className="col-span-2 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-900/60" id="current-active-assignment-card">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-blue-800 dark:text-blue-300 uppercase tracking-wide font-bold">
                        Currently Active Route Assignment
                      </p>
                      <Badge variant="default" size="sm">Existing Assignment</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                      <div>
                        <p className="font-mono text-base font-bold text-charcoal-500 dark:text-stone-100">
                          {pass.studentAssignedRoute?.routeCode} {pass.studentAssignedRoute?.routeName ? `• ${pass.studentAssignedRoute.routeName}` : ''}
                        </p>
                        {pass.studentAssignedBus && (
                          <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                            Active Bus: {formatBusNumber(pass.studentAssignedBus)} ({pass.studentAssignedBus.registrationNumber})
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                        Active transit remains in effect until new pass review is approved
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {pass.ocrExtractedData && (
                <div className="mt-6 p-4 bg-stone-50 dark:bg-charcoal-800 rounded-xl border border-stone-200 dark:border-charcoal-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-terracotta-500" />
                    <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide font-bold">
                      Extracted Document Data & Recognition Log
                    </p>
                  </div>
                  <div className="bg-white dark:bg-charcoal-900 p-3 rounded-lg border border-stone-200 dark:border-charcoal-700 font-mono text-xs text-charcoal-500 dark:text-stone-300 overflow-auto max-h-52 whitespace-pre-wrap">
                    {pass.ocrExtractedData}
                  </div>
                </div>
              )}

              {pass.verificationNotes && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>{pass.verificationNotes}</span>
                </div>
              )}
            </Card>
          ) : (
            <Card className="text-center py-12 border border-stone-200 dark:border-charcoal-700" padding="lg">
              <GraduationCap className="h-16 w-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-stone-100 mb-2">No Bus Pass Uploaded</h2>
              <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
                Upload your pass document to trigger automatic recognition and link your eligible bus assignment.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-semibold hover:bg-terracotta-400 transition-colors shadow-sm text-sm"
              >
                <Camera className="h-4 w-4" />
                Upload Pass Document
              </button>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card padding="lg" className="border border-stone-200 dark:border-charcoal-700">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-stone-100 mb-4">
              Related Transportation
            </h3>
            <div className="space-y-3">
              <Link to="/student/my-bus" className="block p-3.5 rounded-lg border border-stone-200 dark:border-charcoal-600 hover:border-terracotta-300 hover:bg-terracotta-50/50 dark:hover:bg-charcoal-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                    <Bus className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-charcoal-500 dark:text-stone-200">My Bus Dashboard</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">View road map & assigned driver</p>
                  </div>
                </div>
              </Link>
              <Link to="/student/missed-bus" className="block p-3.5 rounded-lg border border-stone-200 dark:border-charcoal-600 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-charcoal-500 dark:text-stone-200">Missed Bus Recovery</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Find alternative bus or request assistance</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}