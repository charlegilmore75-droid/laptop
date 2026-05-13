'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { nameAr: string; nameEn: string; thumbnail?: string | null; images: string[]; slug: string };
  }>;
}

const statusConfig: Record<string, { icon: typeof Package; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  PROCESSING: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  SHIPPED: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  DELIVERED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  CANCELLED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  OUT_OF_STOCK: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
};

export default function OrdersClient({ orders, locale }: { orders: Order[]; locale: string }) {
  const t = useTranslations('order');
  const isRTL = locale === 'ar';

  if (orders.length === 0) {
    return (
      <div className="text-center py-24">
        <Package className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-30" />
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('noOrders')}</h2>
        <p className="text-muted-foreground mb-8">{t('noOrdersDesc')}</p>
        <Link href={`/${locale}/products`} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
          {isRTL ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-3xl font-black text-foreground">{t('myOrders')}</h1>
      {orders.map((order, i) => {
        const config = statusConfig[order.status] || statusConfig.PENDING;
        const StatusIcon = config.icon;
        const statusLabel = isRTL ? ({
          PENDING: 'قيد المعالجة', PROCESSING: 'جاري التجهيز', SHIPPED: 'تم الإرسال',
          DELIVERED: 'تم التسليم', CANCELLED: 'ملغى', OUT_OF_STOCK: 'نفذت الكمية',
        } as Record<string, string>)[order.status] || order.status : order.status;

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-accent/30">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('orderNumber')}</p>
                <p className="font-bold text-foreground font-mono">#{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'التاريخ' : 'Date'}</p>
                <p className="text-sm font-medium text-foreground">{formatDate(order.createdAt, locale)}</p>
              </div>
              <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold', config.bg, config.color)}>
                <StatusIcon className="w-4 h-4" />
                {statusLabel}
              </div>
            </div>

            {/* Items */}
            <div className="p-5 space-y-4">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/50 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.thumbnail || item.product.images[0] || 'https://via.placeholder.com/56'}
                      alt={isRTL ? item.product.nameAr : item.product.nameEn}
                      width={56} height={56}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm line-clamp-1">
                      {isRTL ? item.product.nameAr : item.product.nameEn}
                    </p>
                    <p className="text-muted-foreground text-xs">x{item.quantity}</p>
                  </div>
                  <p className="font-bold text-foreground text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-muted-foreground text-sm text-center">
                  +{order.items.length - 3} {isRTL ? 'منتجات أخرى' : 'more items'}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 bg-accent/20 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? 'الإجمالي' : 'Total'}</p>
                <p className="font-black text-primary text-lg">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
