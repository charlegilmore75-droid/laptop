'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Wallet, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { z } from 'zod';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const checkoutSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(9),
  address: z.string().min(10),
  shippingBranch: z.string().optional(),
  couponCode: z.string().optional(),
  useWallet: z.boolean().optional(),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const t = useTranslations('order');
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const isRTL = locale === 'ar';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { useWallet: false },
  });

  const onSubmit = async (data: CheckoutInput) => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error');
      setOrderId(json.order.id);
      setSuccess(true);
      clearCart();
      toast.success(t('orderSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md space-y-6">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-foreground">{t('orderSuccess')}</h2>
            <p className="text-muted-foreground">{t('orderNumber')}: <span className="font-bold text-foreground">#{orderId.slice(-8).toUpperCase()}</span></p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push(`/${locale}/orders`)} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                {t('myOrders')}
              </button>
              <button onClick={() => router.push(`/${locale}`)} className="border border-border text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-accent transition-colors">
                {isRTL ? 'الرئيسية' : 'Home'}
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 min-h-screen">
        <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-8">{t('orderConfirmation')}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-5">
            {[
              { name: 'fullName' as const, label: t('fullName'), type: 'text' },
              { name: 'phone' as const, label: t('phone'), type: 'tel' },
              { name: 'address' as const, label: t('address'), type: 'text' },
              { name: 'shippingBranch' as const, label: t('shippingBranch'), type: 'text' },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium text-foreground mb-2 block">{field.label}</label>
                <input
                  {...register(field.name)}
                  type={field.type}
                  className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                {errors[field.name] && <p className="text-destructive text-xs mt-1">{errors[field.name]?.message}</p>}
              </div>
            ))}

            {/* Coupon */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">{isRTL ? 'كوبون الخصم (اختياري)' : 'Discount Coupon (optional)'}</label>
              <input
                {...register('couponCode')}
                type="text"
                placeholder={isRTL ? 'أدخل الكود' : 'Enter code'}
                className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Payment */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">{t('paymentMethod')}</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors">
                  <input type="radio" {...register('useWallet')} value="false" className="hidden" />
                  <Banknote className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{t('cashOnDelivery')}</span>
                </label>
                <label className="flex items-center gap-3 border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors">
                  <input type="checkbox" {...register('useWallet')} className="rounded" />
                  <Wallet className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{t('walletPayment')}</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {t('placeOrder')}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 sticky top-24">
              <h3 className="font-bold text-foreground">{isRTL ? 'ملخص الطلب' : 'Order Summary'}</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 flex-1">{item.name} × {item.quantity}</span>
                    <span className="font-semibold text-foreground ms-2">{formatPrice((item.discountPrice ?? item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-black text-foreground">
                <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                <span className="text-primary">{formatPrice(total())}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
