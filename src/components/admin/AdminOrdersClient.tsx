'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatDate, cn } from '@/lib/utils';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  fullName: string;
  phone: string;
  address: string;
  createdAt: string;
  user: { name?: string | null; email: string };
  items: Array<{ id: string; quantity: number; price: number; product: { nameAr: string; nameEn: string; thumbnail?: string | null } }>;
}

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'OUT_OF_STOCK'];
const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700', PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700', OUT_OF_STOCK: 'bg-orange-100 text-orange-700',
};
const statusLabels: Record<string, { ar: string; en: string }> = {
  PENDING: { ar: 'قيد المعالجة', en: 'Pending' }, PROCESSING: { ar: 'جاري التجهيز', en: 'Processing' },
  SHIPPED: { ar: 'تم الإرسال', en: 'Shipped' }, DELIVERED: { ar: 'تم التسليم', en: 'Delivered' },
  CANCELLED: { ar: 'ملغى', en: 'Cancelled' }, OUT_OF_STOCK: { ar: 'نفذت الكمية', en: 'Out of Stock' },
};

export default function AdminOrdersClient({ orders: initialOrders, locale }: { orders: Order[]; locale: string }) {
  const isRTL = locale === 'ar';
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.fullName.toLowerCase().includes(q) || o.user.email.toLowerCase().includes(q) || o.id.includes(q);
    const matchFilter = !filter || o.status === filter;
    return matchSearch && matchFilter;
  });

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error();
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      toast.success(isRTL ? 'تم تحديث الحالة' : 'Status updated');
    } catch { toast.error('Error'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">{isRTL ? 'الطلبات' : 'Orders'}</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={isRTL ? 'بحث...' : 'Search...'} className="w-full border border-border rounded-xl px-4 py-3 ps-11 bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-border rounded-xl px-4 py-3 bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/30 text-sm">
          <option value="">{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]?.[isRTL ? 'ar' : 'en']}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{isRTL ? 'لا توجد طلبات' : 'No orders'}</div>
        ) : filtered.map((order, i) => (
          <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-border bg-accent/20">
              <div>
                <p className="font-bold text-foreground font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt, locale)}</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">{order.fullName}</p>
                <p className="text-muted-foreground text-xs">{order.user.email}</p>
                <p className="text-muted-foreground text-xs">{order.phone}</p>
              </div>
              <p className="font-black text-primary">{formatPrice(order.totalAmount)}</p>
              <div className="flex items-center gap-2">
                <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', statusColors[order.status])}>
                  {statusLabels[order.status]?.[isRTL ? 'ar' : 'en']}
                </span>
                <div className="relative">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className="border border-border rounded-xl px-3 py-2 bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30 appearance-none ps-3 pe-8"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]?.[isRTL ? 'ar' : 'en']}</option>)}
                  </select>
                  {updatingId === order.id ? <Loader2 className="absolute end-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-muted-foreground" /> : <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />}
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 overflow-hidden flex-shrink-0">
                    <Image src={item.product.thumbnail || 'https://via.placeholder.com/40'} alt="" width={40} height={40} className="object-cover w-full h-full" />
                  </div>
                  <span className="text-foreground flex-1 line-clamp-1">{isRTL ? item.product.nameAr : item.product.nameEn}</span>
                  <span className="text-muted-foreground">x{item.quantity}</span>
                  <span className="font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2">📍 {order.address}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
