import { prisma } from '@/lib/db';
import AdminOrdersClient from '@/components/admin/AdminOrdersClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Orders - Admin' };

async function getOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { nameAr: true, nameEn: true, thumbnail: true } } } },
    },
  });
  return orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString() }));
}

export default async function AdminOrdersPage({ params: { locale } }: { params: { locale: string } }) {
  const orders = await getOrders().catch(() => []);
  return <AdminOrdersClient orders={orders as Parameters<typeof AdminOrdersClient>[0]['orders']} locale={locale} />;
}
