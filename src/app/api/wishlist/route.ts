import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: { product: { include: { category: true, _count: { select: { reviews: true } } } } },
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: 'removed' });
    }

    await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
    return NextResponse.json({ action: 'added' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
