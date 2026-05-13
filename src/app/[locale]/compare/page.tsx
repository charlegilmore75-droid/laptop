'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { GitCompare, X, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCompareStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export default function ComparePage() {
  const t = useTranslations('compare');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { ids, toggle, clear } = useCompareStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids.length) { setLoading(false); return; }
    Promise.all(ids.map((id) => fetch(`/api/products/${id}`).then((r) => r.json()).then((d) => d.product)))
      .then((ps) => setProducts(ps.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [ids]);

  const allSpecs = [...new Set(products.flatMap((p) => Object.keys((isRTL ? p.specsAr : p.specsEn) || {})))];

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-foreground">{t('title')}</h1>
          {products.length > 0 && (
            <button onClick={clear} className="text-muted-foreground hover:text-destructive text-sm flex items-center gap-1 transition-colors">
              <X className="w-4 h-4" /> {t('clear')}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <GitCompare className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-30" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('empty')}</h2>
            <p className="text-muted-foreground mb-8">{t('emptyDesc')}</p>
            <Link href={`/${locale}/products`} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">{t('addMore')}</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-36 text-start p-3 text-sm font-semibold text-muted-foreground">{isRTL ? 'المواصفة' : 'Specification'}</th>
                  {products.map((p) => (
                    <th key={p.id} className="p-3 text-center">
                      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                        <button onClick={() => toggle(p.id)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors ms-auto">
                          <X className="w-3 h-3" />
                        </button>
                        <div className="w-24 h-24 rounded-xl bg-secondary/50 overflow-hidden mx-auto">
                          <Image src={p.thumbnail || p.images[0] || 'https://via.placeholder.com/96'} alt={isRTL ? p.nameAr : p.nameEn} width={96} height={96} className="object-cover w-full h-full" />
                        </div>
                        <p className="font-semibold text-foreground text-sm line-clamp-2">{isRTL ? p.nameAr : p.nameEn}</p>
                        <p className="font-black text-primary">{formatPrice(p.discountPrice || p.price)}</p>
                        <Link href={`/${locale}/products/${p.slug || p.id}`} className="block text-xs text-primary hover:underline">{isRTL ? 'عرض التفاصيل' : 'View Details'}</Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'brand', label: isRTL ? 'الماركة' : 'Brand', render: (p: Product) => p.brand || '—' },
                  { key: 'price', label: isRTL ? 'السعر' : 'Price', render: (p: Product) => formatPrice(p.discountPrice || p.price) },
                  { key: 'stock', label: isRTL ? 'المخزون' : 'Stock', render: (p: Product) => p.stock === 0 ? (isRTL ? 'نفذ' : 'Out') : String(p.stock) },
                  ...allSpecs.map((spec) => ({ key: spec, label: spec, render: (p: Product) => ((isRTL ? p.specsAr : p.specsEn) as Record<string, string>)?.[spec] || '—' })),
                ].map((row, i) => (
                  <tr key={row.key} className={i % 2 === 0 ? 'bg-accent/30' : ''}>
                    <td className="p-3 text-sm font-semibold text-foreground">{row.label}</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center text-sm text-muted-foreground">{row.render(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
