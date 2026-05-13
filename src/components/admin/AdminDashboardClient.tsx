'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingBag, DollarSign, Clock, Wallet, TrendingUp, CheckCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DashboardData {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    pendingTopups: number;
    totalRevenue: number;
  };
  recentOrders: Array<{
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    user: { name?: string | null; email: string };
    items: Array<{ product: { nameAr: string; nameEn: string } }>;
  }>;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20',
  SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/20',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/20',
};

const statusLabels: Record<string, { ar: string; en: string }> = {
  PENDING: { ar: 'قيد المعالجة', en: 'Pending' },
  PROCESSING: { ar: 'جاري التجهيز', en: 'Processing' },
  SHIPPED: { ar: 'تم الإرسال', en: 'Shipped' },
  DELIVERED: { ar: 'تم التسليم', en: 'Delivered' },
  CANCELLED: { ar: 'ملغى', en: 'Cancelled' },
};

export default function AdminDashboardClient({ data }: { data: DashboardData }) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const statCards = [
    { icon: DollarSign, label: isRTL ? 'إجمالي المبيعات' : 'Total Revenue', value: formatPrice(data.stats.totalRevenue), color: 'bg-green-500', trend: '+12%' },
    { icon: ShoppingBag, label: isRTL ? 'إجمالي الطلبات' : 'Total Orders', value: data.stats.totalOrders.toLocaleString(), color: 'bg-blue-500', trend: '+8%' },
    { icon: Users, label: isRTL ? 'المستخدمون' : 'Users', value: data.stats.totalUsers.toLocaleString(), color: 'bg-purple-500', trend: '+5%' },
    { icon: Package, label: isRTL ? 'المنتجات' : 'Products', value: data.stats.totalProducts.toLocaleString(), color: 'bg-orange-500', trend: '0%' },
    { icon: Clock, label: isRTL ? 'طلبات معلقة' : 'Pending Orders', value: data.stats.pendingOrders.toLocaleString(), color: 'bg-amber-500', urgent: data.stats.pendingOrders > 0 },
    { icon: Wallet, label: isRTL ? 'طلبات شحن معلقة' : 'Pending Topups', value: data.stats.pendingTopups.toLocaleString(), color: 'bg-red-500', urgent: data.stats.pendingTopups > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-foreground">{isRTL ? 'لوحة التحكم' : 'Dashboard'}</h1>
        <p className="text-muted-foreground mt-1">{isRTL ? 'مرحباً بك في لوحة إدارة LaptopStore' : 'Welcome to LaptopStore Admin Panel'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn('bg-card border rounded-2xl p-5 space-y-3', card.urgent ? 'border-red-300 dark:border-red-700' : 'border-border')}
          >
            <div className="flex items-center justify-between">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white', card.color)}>
                <card.icon className="w-5 h-5" />
              </div>
              {card.trend && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {card.trend}
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{card.value}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-foreground">{isRTL ? 'آخر الطلبات' : 'Recent Orders'}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-accent/50 border-b border-border">
                {[isRTL ? 'رقم الطلب' : 'Order ID', isRTL ? 'العميل' : 'Customer', isRTL ? 'المنتج' : 'Product', isRTL ? 'المبلغ' : 'Amount', isRTL ? 'الحالة' : 'Status', isRTL ? 'التاريخ' : 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{isRTL ? 'لا توجد طلبات' : 'No orders yet'}</td></tr>
              ) : data.recentOrders.map((order) => {
                const statusLabel = statusLabels[order.status]?.[isRTL ? 'ar' : 'en'] || order.status;
                return (
                  <tr key={order.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{order.user.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{order.items[0] ? (isRTL ? order.items[0].product.nameAr : order.items[0].product.nameEn) : '—'}</td>
                    <td className="px-4 py-3 font-bold text-primary text-sm">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', statusColors[order.status] || 'bg-gray-100 text-gray-600')}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(order.createdAt, locale)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
