'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { useWishlistStore } from '@/lib/store';
import type { Product } from '@/types';

export default function WishlistPage() {
  const t = useTranslations('wishlist');
  const locale = useLocale();
  const { ids } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids.length) { setLoading(false); return; }
    Promise.all(ids.map((id) => fetch(`/api/products/${id}`).then((r) => r.json()).then((d) => d.product)))
      .then((prods) => setProducts(prods.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 min-h-screen">
        <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-8">{t('title')}</h1>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-30" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('empty')}</h2>
            <p className="text-muted-foreground mb-8">{t('emptyDesc')}</p>
            <Link href={`/${locale}/products`} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              {locale === 'ar' ? 'تسوق الآن' : 'Shop Now'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
