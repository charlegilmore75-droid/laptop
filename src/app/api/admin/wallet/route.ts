import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topupRequests = await prisma.walletTopupRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        paymentMethod: { select: { nameAr: true, nameEn: true } },
      },
    });

    return NextResponse.json({ topupRequests });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

const approveSchema = z.object({
  requestId: z.string(),
  action: z.enum(['APPROVE', 'REJECT']),
  approvedAmount: z.number().optional(),
  adminNote: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, action, approvedAmount, adminNote } = approveSchema.parse(body);

    const topup = await prisma.walletTopupRequest.findUnique({ where: { id: requestId } });
    if (!topup) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (action === 'APPROVE') {
      const amount = approvedAmount ?? topup.amount;
      await prisma.$transaction(async (tx) => {
        await tx.walletTopupRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED', approvedAmount: amount, adminNote },
        });

        const wallet = await tx.wallet.upsert({
          where: { userId: topup.userId },
          update: { balance: { increment: amount } },
          create: { userId: topup.userId, balance: amount },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount,
            type: 'topup',
            description: 'شحن رصيد معتمد من الإدارة',
            referenceId: requestId,
          },
        });

        await tx.notification.create({
          data: {
            userId: topup.userId,
            titleAr: 'تم قبول طلب الشحن',
            titleEn: 'Top-up request approved',
            bodyAr: `تمت إضافة ${amount} ل.س إلى محفظتك`,
            bodyEn: `${amount} SYP has been added to your wallet`,
          },
        });
      });
    } else {
      await prisma.walletTopupRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED', adminNote },
      });

      await prisma.notification.create({
        data: {
          userId: topup.userId,
          titleAr: 'تم رفض طلب الشحن',
          titleEn: 'Top-up request rejected',
          bodyAr: adminNote || 'تم رفض طلب شحن رصيد المحفظة',
          bodyEn: adminNote || 'Your wallet top-up request was rejected',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
