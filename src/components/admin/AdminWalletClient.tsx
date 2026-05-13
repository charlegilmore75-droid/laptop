'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Loader2, Wallet, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatDate, cn } from '@/lib/utils';

interface TopupRequest {
  id: string; amount: number; status: string; transactionRef?: string | null; receiptImage?: string | null;
  adminNote?: string | null; approvedAmount?: number | null; createdAt: string;
  user: { name?: string | null; email: string };
  paymentMethod: { nameAr: string; nameEn: string };
}

export default function AdminWalletClient({ data, locale }: { data: { topupRequests: TopupRequest[]; walletEnabled: boolean }; locale: string }) {
  const isRTL = locale === 'ar';
  const [requests, setRequests] = useState(data.topupRequests);
  const [walletEnabled, setWalletEnabled] = useState(data.walletEnabled);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [togglingWallet, setTogglingWallet] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const toggleWallet = async () => {
    setTogglingWallet(true);
    try {
      await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ walletEnabled: !walletEnabled }) });
      setWalletEnabled(!walletEnabled);
      toast.success(isRTL ? (walletEnabled ? 'تم تعطيل المحفظة' : 'تم تفعيل المحفظة') : (walletEnabled ? 'Wallet disabled' : 'Wallet enabled'));
    } catch { toast.error('Error'); }
    finally { setTogglingWallet(false); }
  };

  const handleAction = async (requestId: string, action: 'APPROVE' | 'REJECT', approvedAmount?: number) => {
    setProcessingId(requestId);
    try {
      await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, approvedAmount, adminNote: notes[requestId] }),
      });
      setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r));
      toast.success(isRTL ? (action === 'APPROVE' ? 'تمت الموافقة' : 'تم الرفض') : (action === 'APPROVE' ? 'Approved' : 'Rejected'));
    } catch { toast.error('Error'); }
    finally { setProcessingId(null); }
  };

  const pending = requests.filter((r) => r.status === 'PENDING');
  const processed = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">{isRTL ? 'إدارة المحفظة' : 'Wallet Management'}</h1>
        <button onClick={toggleWallet} disabled={togglingWallet} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors', walletEnabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100')}>
          {togglingWallet ? <Loader2 className="w-4 h-4 animate-spin" /> : walletEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          {walletEnabled ? (isRTL ? 'تعطيل المحفظة' : 'Disable Wallet') : (isRTL ? 'تفعيل المحفظة' : 'Enable Wallet')}
        </button>
      </div>

      {/* Pending */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">{isRTL ? `طلبات معلقة (${pending.length})` : `Pending Requests (${pending.length})`}</h2>
        {pending.length === 0 ? (
          <div className="text-center py-10 bg-card border border-border rounded-2xl text-muted-foreground">
            <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
            {isRTL ? 'لا توجد طلبات معلقة' : 'No pending requests'}
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((req) => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-amber-200 dark:border-amber-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-foreground">{req.user.name || req.user.email}</p>
                    <p className="text-xs text-muted-foreground">{req.user.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">{isRTL ? req.paymentMethod.nameAr : req.paymentMethod.nameEn}</p>
                    {req.transactionRef && <p className="text-xs text-muted-foreground">{isRTL ? 'المرجع:' : 'Ref:'} {req.transactionRef}</p>}
                  </div>
                  <div className="text-end">
                    <p className="text-2xl font-black text-primary">{formatPrice(req.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(req.createdAt, locale)}</p>
                  </div>
                </div>
                <input
                  value={notes[req.id] || ''}
                  onChange={(e) => setNotes((p) => ({ ...p, [req.id]: e.target.value }))}
                  placeholder={isRTL ? 'ملاحظة (اختياري)' : 'Note (optional)'}
                  className="w-full border border-border rounded-xl px-3 py-2 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(req.id, 'APPROVE', req.amount)}
                    disabled={processingId === req.id}
                    className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {isRTL ? 'موافقة' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'REJECT')}
                    disabled={processingId === req.id}
                    className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {isRTL ? 'رفض' : 'Reject'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Processed */}
      {processed.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">{isRTL ? 'الطلبات المعالجة' : 'Processed Requests'}</h2>
          <div className="space-y-3">
            {processed.slice(0, 10).map((req) => (
              <div key={req.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">{req.user.name || req.user.email}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(req.createdAt, locale)}</p>
                </div>
                <div className="text-end">
                  <p className="font-bold text-foreground">{formatPrice(req.amount)}</p>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {req.status === 'APPROVED' ? (isRTL ? 'مقبول' : 'Approved') : (isRTL ? 'مرفوض' : 'Rejected')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
