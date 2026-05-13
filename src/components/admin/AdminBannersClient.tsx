'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, Loader2, X, Check, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Banner {
  id: string; titleAr?: string | null; titleEn?: string | null; subtitleAr?: string | null; subtitleEn?: string | null;
  image: string; link?: string | null; isActive: boolean; sortOrder: number; createdAt: string; updatedAt: string;
}

const emptyForm = { titleAr: '', titleEn: '', subtitleAr: '', subtitleEn: '', image: '', link: '', isActive: true, sortOrder: 0 };

export default function AdminBannersClient({ banners: initial, locale }: { banners: Banner[]; locale: string }) {
  const isRTL = locale === 'ar';
  const [banners, setBanners] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.image) { toast.error(isRTL ? 'الصورة مطلوبة' : 'Image is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      const { banner } = await res.json();
      setBanners((p) => [...p, banner]);
      setShowForm(false);
      setForm(emptyForm);
      toast.success(isRTL ? 'تم إضافة البنر' : 'Banner added');
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      setBanners((p) => p.filter((b) => b.id !== id));
      toast.success(isRTL ? 'تم حذف البنر' : 'Banner deleted');
    } catch { toast.error('Error'); }
    finally { setDeletingId(null); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/banners/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive }) });
    setBanners((p) => p.map((b) => b.id === id ? { ...b, isActive: !isActive } : b));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">{isRTL ? 'البنرات' : 'Banners'}</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          {isRTL ? 'إضافة بنر' : 'Add Banner'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner, i) => (
          <motion.div key={banner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={cn('bg-card border rounded-2xl overflow-hidden', !banner.isActive && 'opacity-60')}>
            <div className="relative h-40">
              <Image src={banner.image} alt={banner.titleAr || banner.titleEn || ''} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              {(banner.titleAr || banner.titleEn) && (
                <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                  <p className="text-white font-bold text-lg">{isRTL ? banner.titleAr : banner.titleEn}</p>
                </div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between border-t border-border">
              <div className="text-sm">
                <p className="font-semibold text-foreground">{isRTL ? banner.titleAr || '—' : banner.titleEn || '—'}</p>
                {banner.link && <p className="text-muted-foreground text-xs">{banner.link}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(banner.id, banner.isActive)} className={cn('w-8 h-8 rounded-lg border flex items-center justify-center transition-colors', banner.isActive ? 'border-green-500 text-green-600' : 'border-border text-muted-foreground')}>
                  {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(banner.id)} disabled={deletingId === banner.id} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors">
                  {deletingId === banner.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-2 text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            {isRTL ? 'لا توجد بنرات' : 'No banners'}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{isRTL ? 'إضافة بنر' : 'Add Banner'}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              {[
                { key: 'titleAr', label: isRTL ? 'العنوان (عربي)' : 'Title (Arabic)' },
                { key: 'titleEn', label: isRTL ? 'العنوان (إنجليزي)' : 'Title (English)' },
                { key: 'image', label: isRTL ? 'رابط الصورة' : 'Image URL' },
                { key: 'link', label: isRTL ? 'الرابط (اختياري)' : 'Link (optional)' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                  <input value={(form as Record<string, string>)[f.key] || ''} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
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
