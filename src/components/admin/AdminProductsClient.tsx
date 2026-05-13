'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Star, Package, Loader2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Product, Category } from '@/types';

interface AdminProductsClientProps {
  data: {
    products: (Product & { _count: { reviews: number; orderItems: number } })[];
    categories: Category[];
  };
  locale: string;
}

interface ProductForm {
  nameAr: string; nameEn: string; descriptionAr: string; descriptionEn: string;
  price: string; discountPrice: string; stock: string; categoryId: string;
  brand: string; isFeatured: boolean; isActive: boolean;
}

const emptyForm: ProductForm = { nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', price: '', discountPrice: '', stock: '', categoryId: '', brand: '', isFeatured: false, isActive: true };

export default function AdminProductsClient({ data, locale }: AdminProductsClientProps) {
  const isRTL = locale === 'ar';
  const [products, setProducts] = useState(data.products);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.nameAr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({
      nameAr: p.nameAr, nameEn: p.nameEn, descriptionAr: p.descriptionAr || '', descriptionEn: p.descriptionEn || '',
      price: String(p.price), discountPrice: String(p.discountPrice || ''), stock: String(p.stock),
      categoryId: p.categoryId, brand: p.brand || '', isFeatured: p.isFeatured, isActive: p.isActive,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null, stock: parseInt(form.stock) };
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Error');
      toast.success(isRTL ? (editingId ? 'تم تحديث المنتج' : 'تم إضافة المنتج') : (editingId ? 'Product updated' : 'Product added'));
      setShowForm(false);
      window.location.reload();
    } catch { toast.error(isRTL ? 'حدث خطأ' : 'An error occurred'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(isRTL ? 'تم حذف المنتج' : 'Product deleted');
    } catch { toast.error('Error'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">{isRTL ? 'المنتجات' : 'Products'}</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          {isRTL ? 'إضافة منتج' : 'Add Product'}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={isRTL ? 'بحث...' : 'Search...'} className="w-full border border-border rounded-xl px-4 py-3 ps-11 bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-accent/50 border-b border-border">
                {[isRTL ? 'المنتج' : 'Product', isRTL ? 'الفئة' : 'Category', isRTL ? 'السعر' : 'Price', isRTL ? 'المخزون' : 'Stock', isRTL ? 'الحالة' : 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground"><Package className="w-10 h-10 mx-auto mb-2 opacity-30" />{isRTL ? 'لا توجد منتجات' : 'No products'}</td></tr>
              ) : filtered.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-accent/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary/50 overflow-hidden flex-shrink-0">
                        <Image src={product.thumbnail || product.images[0] || 'https://via.placeholder.com/48'} alt={product.nameAr} width={48} height={48} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{isRTL ? product.nameAr : product.nameEn}</p>
                        <p className="text-xs text-muted-foreground">{product.brand || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{isRTL ? product.category?.nameAr : product.category?.nameEn}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-primary text-sm">{formatPrice(product.discountPrice || product.price)}</p>
                    {product.discountPrice && <p className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-sm font-semibold', product.stock === 0 ? 'text-red-600' : product.stock < 5 ? 'text-amber-600' : 'text-green-600')}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('w-2 h-2 rounded-full', product.isActive ? 'bg-green-500' : 'bg-red-500')} />
                      <span className="text-xs text-muted-foreground">{product.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'مخفي' : 'Hidden')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors disabled:opacity-50"
                      >
                        {deletingId === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">{editingId ? (isRTL ? 'تعديل المنتج' : 'Edit Product') : (isRTL ? 'إضافة منتج' : 'Add Product')}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'nameAr', label: isRTL ? 'الاسم (عربي)' : 'Name (Arabic)', type: 'text' },
                  { key: 'nameEn', label: isRTL ? 'الاسم (إنجليزي)' : 'Name (English)', type: 'text' },
                  { key: 'price', label: isRTL ? 'السعر' : 'Price', type: 'number' },
                  { key: 'discountPrice', label: isRTL ? 'سعر الخصم' : 'Discount Price', type: 'number' },
                  { key: 'stock', label: isRTL ? 'المخزون' : 'Stock', type: 'number' },
                  { key: 'brand', label: isRTL ? 'الماركة' : 'Brand', type: 'text' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                    <input type={f.type} value={form[f.key as keyof ProductForm] as string} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{isRTL ? 'الفئة' : 'Category'}</label>
                  <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))} className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">{isRTL ? 'اختر الفئة' : 'Select category'}</option>
                    {data.categories.map((c) => <option key={c.id} value={c.id}>{isRTL ? c.nameAr : c.nameEn}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                  <textarea value={form.descriptionAr} onChange={(e) => setForm((p) => ({ ...p, descriptionAr: e.target.value }))} rows={3} className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                  <textarea value={form.descriptionEn} onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))} rows={3} className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>

                <div className="col-span-2 flex items-center gap-6">
                  {[
                    { key: 'isFeatured', label: isRTL ? 'منتج مميز' : 'Featured' },
                    { key: 'isActive', label: isRTL ? 'نشط' : 'Active' },
                  ].map((f) => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setForm((p) => ({ ...p, [f.key]: !p[f.key as keyof ProductForm] }))} className={cn('w-10 h-6 rounded-full transition-colors', form[f.key as keyof ProductForm] ? 'bg-primary' : 'bg-muted')}>
                        <div className={cn('w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform m-0.5', form[f.key as keyof ProductForm] ? 'translate-x-4' : 'translate-x-0')} />
                      </div>
                      <span className="text-sm text-foreground">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isRTL ? 'حفظ' : 'Save'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-accent transition-colors">
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
