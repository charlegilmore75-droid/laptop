import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'OUT_OF_STOCK']) });

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status } = schema.parse(body);

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: { user: { select: { id: true } } },
    });

    const statusMessages: Record<string, { ar: string; en: string }> = {
      PROCESSING: { ar: 'جاري تجهيز طلبك', en: 'Your order is being processed' },
      SHIPPED: { ar: 'تم إرسال طلبك', en: 'Your order has been shipped' },
      DELIVERED: { ar: 'تم تسليم طلبك', en: 'Your order has been delivered' },
      CANCELLED: { ar: 'تم إلغاء طلبك', en: 'Your order has been cancelled' },
    };

    const msg = statusMessages[status];
    if (msg) {
      await prisma.notification.create({
        data: {
          userId: order.user.id,
          titleAr: `تحديث الطلب #${order.id.slice(-6)}`,
          titleEn: `Order Update #${order.id.slice(-6)}`,
          bodyAr: msg.ar,
          bodyEn: msg.en,
          link: '/ar/orders',
        },
      });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
