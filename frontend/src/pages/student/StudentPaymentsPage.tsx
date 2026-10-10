import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CreditCard, Calendar, Loader2, AlertCircle, CheckCircle, XCircle, Clock, DollarSign, FileText } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Payment {
  id: string;
  orderId: string;
  gatewayTransactionId?: string;
  method?: 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'EMI';
  status: 'PENDING' | 'CREATED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  amount: number;
  currency: string;
  description?: string;
  feeType?: string;
  academicYear?: string;
  initiatedAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  refundAmount?: number;
  refundedAt?: string;
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CREATED: { color: 'bg-blue-100 text-blue-700', icon: Clock },
  PROCESSING: { color: 'bg-blue-100 text-blue-700', icon: Loader2 },
  SUCCESS: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  FAILED: { color: 'bg-red-100 text-red-700', icon: XCircle },
  CANCELLED: { color: 'bg-stone-100 text-stone-700', icon: XCircle },
  REFUNDED: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  PARTIALLY_REFUNDED: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
} as const;

const methodColors = {
  UPI: 'bg-green-100 text-green-700',
  CARD: 'bg-blue-100 text-blue-700',
  NET_BANKING: 'bg-purple-100 text-purple-700',
  WALLET: 'bg-orange-100 text-orange-700',
  EMI: 'bg-indigo-100 text-indigo-700',
} as const;

export function StudentPaymentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const size = 20;

  const { data: paymentsData, isLoading, error } = useQuery({
    queryKey: ['student-payments', page],
    queryFn: () => api.getStudentPayments(page, 20),
  });

  const payments = paymentsData?.content || [];
  const totalElements = paymentsData?.totalElements || 0;
  const totalPages = paymentsData?.totalPages || 0;

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-3/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-stone-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load payments</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">Payments</h1>
        <p className="text-stone-600 mt-1">View your payment history and manage transport fees.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card className="bg-green-50 border-green-200">
          <div className="p-4 text-center">
            <p className="font-heading text-2xl font-bold text-green-600">
              {payments.filter((p: { status: string }) => p.status === 'SUCCESS').length}
            </p>
            <p className="text-xs text-green-700">Successful</p>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="p-4 text-center">
            <p className="font-heading text-2xl font-bold text-red-600">
              {payments.filter((p: { status: string }) => p.status === 'FAILED').length}
            </p>
            <p className="text-xs text-red-700">Failed</p>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="p-4 text-center">
            <p className="font-heading text-2xl font-bold text-yellow-600">
              {payments.filter((p: { status: string }) => p.status === 'PENDING' || p.status === 'PROCESSING' || p.status === 'CREATED').length}
            </p>
            <p className="text-xs text-yellow-700">Pending</p>
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4 text-center">
            <p className="font-heading text-2xl font-bold text-blue-600">
              ₹{payments.filter((p: { status: string; amount: number }) => p.status === 'SUCCESS').reduce((sum: number, p: { amount: number }) => sum + p.amount, 0).toLocaleString()}
            </p>
            <p className="text-xs text-blue-700">Total Paid</p>
          </div>
        </Card>
      </div>

      {payments.length === 0 ? (
        <Card className="text-center py-12">
          <CreditCard className="h-16 w-16 text-stone-300 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-charcoal-500 mb-2">No Payments Yet</h2>
          <p className="text-stone-500 mb-6">You haven't made any transport fee payments yet.</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-stone-500 border-b border-stone-200 bg-stone-50">
                    <th className="p-3 font-medium">Order ID</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Method</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: { id: string; orderId: string; feeType?: string; amount: number; currency: string; status: string; method?: string; createdAt: string; initiatedAt?: string; completedAt?: string; gatewayTransactionId?: string }) => {
                    const config = statusConfig[payment.status as keyof typeof statusConfig];
                    const Icon = config.icon;
                    return (
                      <tr key={payment.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                        <td className="p-3">
                          <p className="font-mono text-sm text-charcoal-500">{payment.orderId}</p>
                          {payment.feeType && <p className="text-xs text-stone-500">{payment.feeType}</p>}
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" size="sm">{payment.feeType || 'Transport Fee'}</Badge>
                        </td>
                        <td className="p-3">
                          <p className="font-mono text-lg font-bold text-charcoal-500">₹{payment.amount.toLocaleString()}</p>
                          {payment.currency && payment.currency !== 'INR' && <p className="text-xs text-stone-500">{payment.currency}</p>}
                        </td>
                        <td className="p-3">
                          <Badge variant="default" className={cn(config.color)}>
                            <config.icon className="h-3 w-3 inline mr-1" />
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {payment.method && (
                            <Badge variant="default" className={methodColors[payment.method as keyof typeof methodColors] || 'bg-stone-100 text-stone-700'} size="sm">
                              {payment.method}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm text-stone-600 whitespace-nowrap">
                          {format(payment.initiatedAt ? parseISO(payment.initiatedAt) : new Date(), 'MMM d, yyyy HH:mm')}
                          {payment.completedAt && (
                            <p className="text-xs text-stone-500 mt-1">Completed: {formatDistanceToNow(parseISO(payment.completedAt!), { addSuffix: true })}</p>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors" title="View Details">
                              <FileText className="h-4 w-4" />
                            </button>
                            {payment.gatewayTransactionId && (
                              <a href="#" className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors" title="View on Gateway">
                                <DollarSign className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-stone-200">
                <div className="text-sm text-stone-500">
                  Showing {Math.min((page * 20) + 1, totalElements)} to {Math.min((page + 1) * 20, totalElements)} of {totalElements} payments
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 0}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      <div className="mt-8">
        <h2 className="font-heading text-xl font-semibold text-charcoal-500 mb-4">Fee Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-terracotta-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-terracotta-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Semester Fee</p>
                <p className="font-heading text-xl font-bold text-terracotta-600">₹5,000</p>
              </div>
            </div>
            <p className="text-sm text-stone-500">Per semester transport fee</p>
          </Card>
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Payment Due</p>
                <p className="font-heading text-xl font-bold text-green-600">15th of each month</p>
              </div>
            </div>
            <p className="text-sm text-stone-500">Due date for monthly payments</p>
          </Card>
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Payment Methods</p>
                <p className="font-heading text-xl font-bold text-blue-600">UPI, Card, Net Banking</p>
              </div>
            </div>
            <p className="text-sm text-stone-500">Multiple payment options available</p>
          </Card>
        </div>
      </div>
    </div>
  );
}