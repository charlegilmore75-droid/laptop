import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalUsers, totalProducts, totalOrders, pendingOrders,
      deliveredOrders, pendingTopups, totalRevenue, recentOrders, topProducts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.walletTopupRequest.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { nameAr: true, nameEn: true } } } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { nameAr: true, nameEn: true, thumbnail: true, price: true },
        });
        return { ...item, product };
      })
    );

    const monthlySales = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        pendingTopups,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      recentOrders,
      topProducts: topProductsWithDetails,
      monthlySales,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
