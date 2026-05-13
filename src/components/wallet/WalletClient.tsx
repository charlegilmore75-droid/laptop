'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface WalletData {
  wallet: { balance: number; isActive: boolean } | null;
  transactions: Array<{ id: string; amount: number; type: string; description?: string | null; createdAt: string }>;
  topupRequests: Array<{ id: string; amount: number; status: string; createdAt: string; paymentMethod: { nameAr: string; nameEn: string } }>;
  paymentMethods: Array<{ id: string; nameAr: string; nameEn: string; accountInfo?: string | null; description?: string | null; logo?: string | null }>;
  walletEnabled: boolean;
}

export default function WalletClient({ data, locale }: { data: WalletData; locale: string }) {
  const t = useTranslations('wallet');
  const isRTL = locale === 'ar';
  const [showTopup, setShowTopup] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'requests'>('transactions');

  if (!data.walletEnabled) {
    return (
      <div className="text-center py-24">
        <Wallet className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-30" />
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('disabled')}</h2>
      </div>
    );
  }

  const handleTopup = async () => {
    if (!selectedMethod || !amount) return;
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: selectedMethod, amount: parseFloat(amount), transactionRef }),
      });
      if (!res.ok) throw new Error('Error');
      toast.success(t('topupSuccess'));
      setShowTopup(false);
      setAmount('');
      setTransactionRef('');
      setSelectedMethod('');
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedMethodData = data.paymentMethods.find((m) => m.id === selectedMethod);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-black text-foreground">{t('title')}</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/60 text-sm">{t('balance')}</p>
              <p className="text-3xl font-black">{formatPrice(data.wallet?.balance || 0)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowTopup(true)}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('topup')}
          </button>
        </div>
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <CheckCircle className="w-4 h-4 text-green-400" />
          {isRTL ? 'محفظتك نشطة' : 'Your wallet is active'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['transactions', 'requests'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn('px-6 py-3 text-sm font-semibold border-b-2 transition-colors', activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
          >
            {tab === 'transactions' ? t('transactions') : isRTL ? 'طلبات الشحن' : 'Top-up Requests'}
          </button>
        ))}
      </div>

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <div className="space-y-3">
          {data.transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t('noTransactions')}</div>
          ) : (
            data.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20')}>
                  {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5 text-green-600" /> : <ArrowUpRight className="w-5 h-5 text-red-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{tx.description || tx.type}</p>
                  <p className="text-muted-foreground text-xs">{formatDate(tx.createdAt, locale)}</p>
                </div>
                <p className={cn('font-black', tx.amount > 0 ? 'text-green-600' : 'text-red-600')}>
                  {tx.amount > 0 ? '+' : ''}{formatPrice(tx.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Topup Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {data.topupRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{isRTL ? 'لا توجد طلبات' : 'No requests'}</div>
          ) : (
            data.topupRequests.map((req) => {
              const statusConfig = {
                PENDING: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', label: t('pending') },
                APPROVED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', label: t('approved') },
                REJECTED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', label: t('rejected') },
              }[req.status] || { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: req.status };
              const StatusIcon = statusConfig.icon;
              return (
                <div key={req.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{isRTL ? req.paymentMethod.nameAr : req.paymentMethod.nameEn}</p>
                      <p className="text-muted-foreground text-xs">{formatDate(req.createdAt, locale)}</p>
                    </div>
                    <div className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', statusConfig.bg, statusConfig.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </div>
                  </div>
                  <p className="font-black text-primary text-xl">{formatPrice(req.amount)}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Topup Modal */}
      <AnimatePresence>
        {showTopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowTopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-foreground">{t('topup')}</h3>

              {/* Payment Methods */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('selectPayment')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {data.paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn('p-3 rounded-xl border text-sm font-medium text-start transition-all', selectedMethod === method.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:border-primary/50')}
                    >
                      {isRTL ? method.nameAr : method.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Method Info */}
              {selectedMethodData?.accountInfo && (
                <div className="bg-accent/50 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-foreground mb-1">{isRTL ? 'معلومات التحويل:' : 'Transfer Details:'}</p>
                  <p className="text-muted-foreground whitespace-pre-line">{selectedMethodData.accountInfo}</p>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('amount')} (ل.س)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Transaction Ref */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('transactionRef')}</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder={isRTL ? 'رقم العملية أو المرجع' : 'Transaction ID or reference'}
                  className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <button
                onClick={handleTopup}
                disabled={loading || !selectedMethod || !amount}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {t('submitRequest')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
