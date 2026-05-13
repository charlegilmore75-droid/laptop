import { prisma } from '@/lib/db';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard - Admin' };

async function getDashboardData() {
  const [totalUsers, totalProducts, totalOrders, pendingOrders, totalRevenue, recentOrders, pendingTopups] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, items: { take: 1, include: { product: { select: { nameAr: true, nameEn: true } } } } },
    }),
    prisma.walletTopupRequest.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      pendingTopups,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    },
    recentOrders: recentOrders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString() })),
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData().catch(() => ({ stats: { totalUsers: 0, totalProducts: 0, totalOrders: 0, pendingOrders: 0, pendingTopups: 0, totalRevenue: 0 }, recentOrders: [] }));
  return <AdminDashboardClient data={data as Parameters<typeof AdminDashboardClient>[0]['data']} />;
}
