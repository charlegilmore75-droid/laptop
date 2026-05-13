'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CreditCard, Loader2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string; nameAr: string; nameEn: string; description?: string | null;
  accountInfo?: string | null; isActive: boolean; sortOrder: number;
}

const emptyForm = { nameAr: '', nameEn: '', description: '', accountInfo: '', isActive: true, sortOrder: 0 };

export default function AdminPaymentMethodsClient({ methods: initial, locale }: { methods: PaymentMethod[]; locale: string }) {
  const isRTL = locale === 'ar';
  const [methods, setMethods] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/payment-methods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const { paymentMethod } = await res.json();
      setMethods((p) => [...p, paymentMethod]);
      setShowForm(false);
      setForm(emptyForm);
      toast.success(isRTL ? 'تمت الإضافة' : 'Added');
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      setMethods((p) => p.filter((m) => m.id !== id));
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
    } catch { toast.error('Error'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">{isRTL ? 'طرق الدفع' : 'Payment Methods'}</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> {isRTL ? 'إضافة' : 'Add'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method, i) => (
          <motion.div key={method.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{isRTL ? method.nameAr : method.nameEn}</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? method.nameEn : method.nameAr}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(method.id)} disabled={deletingId === method.id} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors">
                {deletingId === method.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
            {method.accountInfo && (
              <div className="bg-accent/50 rounded-xl p-3 text-xs text-muted-foreground whitespace-pre-line">{method.accountInfo}</div>
            )}
          </motion.div>
        ))}
        {methods.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            {isRTL ? 'لا توجد طرق دفع' : 'No payment methods'}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{isRTL ? 'إضافة طريقة دفع' : 'Add Payment Method'}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              {[
                { key: 'nameAr', label: isRTL ? 'الاسم (عربي)' : 'Name (Arabic)' },
                { key: 'nameEn', label: isRTL ? 'الاسم (إنجليزي)' : 'Name (English)' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                  <input value={(form as Record<string, string>)[f.key] || ''} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{isRTL ? 'معلومات الحساب (رقم المحفظة وغيره)' : 'Account Info (wallet number, etc.)'}</label>
                <textarea value={form.accountInfo} onChange={(e) => setForm((p) => ({ ...p, accountInfo: e.target.value }))} rows={4} className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isRTL ? 'حفظ' : 'Save'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-accent transition-colors">{isRTL ? 'إلغاء' : 'Cancel'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
