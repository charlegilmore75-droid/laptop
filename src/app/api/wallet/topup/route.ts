import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { walletTopupSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = walletTopupSchema.parse(body);

    const topup = await prisma.walletTopupRequest.create({
      data: {
        userId: session.user.id,
        paymentMethodId: data.paymentMethodId,
        amount: data.amount,
        transactionRef: data.transactionRef,
        receiptImage: body.receiptImage || null,
      },
    });

    return NextResponse.json({ topup });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
