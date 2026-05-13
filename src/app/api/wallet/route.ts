import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [wallet, transactions, topupRequests, settings] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: session.user.id } }),
      prisma.walletTransaction.findMany({
        where: { wallet: { userId: session.user.id } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.walletTopupRequest.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { paymentMethod: true },
      }),
      prisma.siteSettings.findUnique({ where: { key: 'walletEnabled' } }),
    ]);

    return NextResponse.json({
      wallet,
      transactions,
      topupRequests,
      walletEnabled: settings?.value === 'true',
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
