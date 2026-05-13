'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import toast from 'react-hot-toast';

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const { items, updateQuantity, removeItem, total } = useCartStore();
  const isRTL = locale === 'ar';

  const handleCheckout = () => {
    if (!session?.user) {
      toast.error(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      router.push(`/${locale}/auth/login`);
      return;
    }
    router.push(`/${locale}/checkout`);
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 min-h-screen">
        <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-8">{t('title')}</h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingCart className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-30" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('empty')}</h2>
            <p className="text-muted-foreground mb-8">{t('emptyDesc')}</p>
            <Link href={`/${locale}/products`} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              {t('continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 bg-card border border-border rounded-2xl p-4"
                  >
                    <div className="w-20 h-20 rounded-xl bg-secondary/50 overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-semibold text-foreground line-clamp-2 text-sm">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-black text-primary">{formatPrice((item.discountPrice ?? item.price) * item.quantity)}</p>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4 sticky top-24">
                <h3 className="font-bold text-foreground text-lg">{isRTL ? 'ملخص الطلب' : 'Order Summary'}</h3>
                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('subtotal')}</span>
                    <span>{formatPrice(total())}</span>
                  </div>
                  <div className="flex justify-between font-black text-foreground text-lg border-t border-border pt-2 mt-2">
                    <span>{t('total')}</span>
                    <span className="text-primary">{formatPrice(total())}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {t('checkout')}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link href={`/${locale}/products`} className="block text-center text-muted-foreground hover:text-foreground text-sm transition-colors">
                  {t('continueShopping')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
