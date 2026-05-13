'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Share2, GitCompare, Minus, Plus, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { formatPrice, getDiscountPercent, cn } from '@/lib/utils';
import ProductCard from './ProductCard';
import type { Product, Review } from '@/types';

interface ProductDetailClientProps {
  product: Product & { reviews: Review[]; avgRating: number };
  related: Product[];
  locale: string;
}

export default function ProductDetailClient({ product, related, locale }: ProductDetailClientProps) {
  const t = useTranslations('products');
  const isRTL = locale === 'ar';
  const { data: session } = useSession();
  const addToCart = useCartStore((s) => s.addItem);
  const { toggle: toggleWishlist, has: inWishlist } = useWishlistStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [added, setAdded] = useState(false);

  const name = isRTL ? product.nameAr : product.nameEn;
  const description = isRTL ? product.descriptionAr : product.descriptionEn;
  const specs = isRTL ? product.specsAr : product.specsEn;
  const images = [product.thumbnail || product.images[0], ...product.images.filter((i) => i !== product.thumbnail)].filter(Boolean) as string[];
  const effectivePrice = product.discountPrice ?? product.price;
  const discountPercent = product.discountPrice ? getDiscountPercent(product.price, product.discountPrice) : 0;
  const isOutOfStock = product.stock === 0;
  const isWishlisted = inWishlist(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({ id: product.id, name, price: product.price, discountPrice: product.discountPrice ?? undefined, image: images[0] || '', quantity, stock: product.stock });
    setAdded(true);
    toast.success(isRTL ? 'تمت الإضافة إلى السلة' : 'Added to cart');
    setTimeout(() => setAdded(false), 2000);
  };

  const submitReview = async () => {
    if (!session?.user) { toast.error(isRTL ? 'يجب تسجيل الدخول' : 'Please login'); return; }
    setSubmittingReview(true);
    try {
      await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      toast.success(isRTL ? 'تم إرسال التقييم' : 'Review submitted');
      setReviewComment('');
    } finally { setSubmittingReview(false); }
  };

  return (
    <div className="space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}`} className="hover:text-foreground">{isRTL ? 'الرئيسية' : 'Home'}</Link>
        <span>/</span>
        <Link href={`/${locale}/products`} className="hover:text-foreground">{isRTL ? 'المنتجات' : 'Products'}</Link>
        <span>/</span>
        <span className="text-foreground font-medium line-clamp-1">{name}</span>
      </nav>

      {/* Main Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-secondary/30 rounded-3xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div key={selectedImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                <Image src={images[selectedImage] || 'https://via.placeholder.com/600'} alt={name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </motion.div>
            </AnimatePresence>
            {discountPercent > 0 && (
              <div className="absolute top-4 start-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">-{discountPercent}%</div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setSelectedImage((s) => (s - 1 + images.length) % images.length)} className="absolute start-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/50 rounded-full flex items-center justify-center shadow-lg">
                  {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => setSelectedImage((s) => (s + 1) % images.length)} className="absolute end-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/50 rounded-full flex items-center justify-center shadow-lg">
                  {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={cn('w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all', i === selectedImage ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100')}>
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.brand && <p className="text-primary font-bold uppercase text-sm tracking-wide">{product.brand}</p>}
          <h1 className="text-2xl lg:text-3xl font-black text-foreground leading-snug">{name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={cn('w-5 h-5', s <= Math.round(product.avgRating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')} />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">({product._count?.reviews || product.reviews.length} {isRTL ? 'تقييم' : 'reviews'})</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-primary">{formatPrice(effectivePrice)}</span>
            {product.discountPrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
            )}
            {discountPercent > 0 && (
              <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded-lg">-{discountPercent}%</span>
            )}
          </div>

          {/* Stock */}
          <div className={cn('flex items-center gap-2 text-sm font-medium', isOutOfStock ? 'text-red-600' : 'text-green-600')}>
            <div className={cn('w-2 h-2 rounded-full', isOutOfStock ? 'bg-red-500' : 'bg-green-500')} />
            {isOutOfStock ? t('outOfStock') : `${t('inStock')} (${product.stock})`}
          </div>

          {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">{t('quantity')}:</span>
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-bold text-foreground">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn('flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all', isOutOfStock ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-xl shadow-primary/20')}
            >
              {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
              {isOutOfStock ? t('outOfStock') : added ? (isRTL ? 'تمت الإضافة' : 'Added!') : t('addToCart')}
            </button>
            <button
              onClick={() => { toggleWishlist(product.id); toast.success(isWishlisted ? (isRTL ? 'تمت الإزالة' : 'Removed') : (isRTL ? 'تمت الإضافة' : 'Added')); }}
              className={cn('w-14 h-14 rounded-2xl border flex items-center justify-center transition-all', isWishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-border text-muted-foreground hover:text-red-500 hover:border-red-500')}
            >
              <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-border mb-6">
          {[
            { key: 'specs', label: t('specifications') },
            { key: 'reviews', label: `${t('reviews')} (${product.reviews.length})` },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as 'specs' | 'reviews')} className={cn('px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors', activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'specs' && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {specs && Object.keys(specs).length > 0 ? (
              Object.entries(specs).map(([key, val], i) => (
                <div key={key} className={cn('flex items-start gap-4 px-6 py-4', i % 2 === 0 ? 'bg-accent/30' : '')}>
                  <span className="font-semibold text-foreground text-sm w-40 flex-shrink-0">{key}</span>
                  <span className="text-muted-foreground text-sm">{val}</span>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-muted-foreground">{isRTL ? 'لا توجد مواصفات مضافة' : 'No specifications added yet'}</div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Write review */}
            {session?.user && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-foreground">{t('writeReview')}</h3>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)}>
                      <Star className={cn('w-6 h-6 transition-colors', s <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground hover:text-amber-300')} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} placeholder={isRTL ? 'شارك تجربتك مع هذا المنتج...' : 'Share your experience with this product...'} className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm" />
                <button onClick={submitReview} disabled={submittingReview} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60">
                  {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('submitReview')}
                </button>
              </div>
            )}

            {product.reviews.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
                {isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
              </div>
            ) : product.reviews.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {review.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-semibold text-foreground text-sm">{review.user?.name || (isRTL ? 'مستخدم' : 'User')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => <Star key={s} className={cn('w-3.5 h-3.5', s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')} />)}
                  </div>
                </div>
                {review.comment && <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-black text-foreground mb-6">{t('relatedProducts')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
