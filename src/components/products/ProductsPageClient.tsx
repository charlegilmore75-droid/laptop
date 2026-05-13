'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '@/components/shared/Skeleton';
import { cn } from '@/lib/utils';
import type { Product, Category } from '@/types';

interface ProductsPageClientProps {
  initialData: {
    products: Product[];
    total: number;
    totalPages: number;
    page: number;
    categories: Category[];
    brands: string[];
  };
  locale: string;
  searchParams: Record<string, string | undefined>;
}

export default function ProductsPageClient({ initialData, locale, searchParams }: ProductsPageClientProps) {
  const t = useTranslations('products');
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isRTL = locale === 'ar';

  const updateParams = (key: string, value: string | undefined) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => { if (v && k !== key && k !== 'page') params.set(k, v); });
    if (value) params.set(key, value);
    startTransition(() => {
      router.push(`/${locale}/products?${params.toString()}`);
    });
  };

  const { products, total, totalPages, page, categories, brands } = initialData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isRTL ? `${total} منتج` : `${total} products`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            onChange={(e) => updateParams('sort', e.target.value || undefined)}
            defaultValue={searchParams.sort || ''}
            className="border border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">{t('sortOptions.newest')}</option>
            <option value="price_asc">{t('sortOptions.priceAsc')}</option>
            <option value="price_desc">{t('sortOptions.priceDesc')}</option>
            <option value="featured">{t('sortOptions.featured')}</option>
          </select>
          {/* Filter Toggle (mobile) */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="lg:hidden flex items-center gap-2 border border-border rounded-xl px-3 py-2 text-sm bg-card text-foreground"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('filter')}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside
          className={cn(
            'w-64 flex-shrink-0 space-y-6',
            'hidden lg:block',
            filterOpen && 'fixed inset-0 z-50 bg-background p-4 overflow-y-auto lg:static lg:bg-transparent'
          )}
        >
          {filterOpen && (
            <button onClick={() => setFilterOpen(false)} className="lg:hidden flex items-center gap-2 text-muted-foreground mb-4">
              <X className="w-5 h-5" /> {isRTL ? 'إغلاق' : 'Close'}
            </button>
          )}

          {/* Categories */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-foreground">{t('category')}</h3>
            <button
              onClick={() => updateParams('category', undefined)}
              className={cn('w-full text-start text-sm px-3 py-2 rounded-xl transition-colors', !searchParams.category ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent')}
            >
              {isRTL ? 'الكل' : 'All'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParams('category', cat.slug)}
                className={cn('w-full text-start text-sm px-3 py-2 rounded-xl transition-colors', searchParams.category === cat.slug ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent')}
              >
                {isRTL ? cat.nameAr : cat.nameEn}
              </button>
            ))}
          </div>

          {/* Brands */}
          {brands.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-foreground">{t('brand')}</h3>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => updateParams('brand', searchParams.brand === brand ? undefined : brand)}
                  className={cn('w-full text-start text-sm px-3 py-2 rounded-xl transition-colors', searchParams.brand === brand ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent')}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-foreground">{t('stockStatus')}</h3>
            <button
              onClick={() => updateParams('inStock', searchParams.inStock === 'true' ? undefined : 'true')}
              className={cn('w-full text-start text-sm px-3 py-2 rounded-xl transition-colors', searchParams.inStock === 'true' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent')}
            >
              {isRTL ? 'متوفر فقط' : 'In Stock Only'}
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {isPending ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t('noProducts')}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => updateParams('page', String(page - 1))}
                disabled={page <= 1}
                className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
              >
                {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParams('page', String(p))}
                  className={cn('w-10 h-10 rounded-xl border text-sm font-semibold transition-colors', p === page ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-accent')}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => updateParams('page', String(page + 1))}
                disabled={page >= totalPages}
                className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
              >
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
