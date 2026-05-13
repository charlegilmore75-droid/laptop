import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { reviewSchema } from '@/lib/validations';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = reviewSchema.parse(body);

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: session.user.id, productId: product.id } },
      update: { rating: data.rating, comment: data.comment },
      create: { userId: session.user.id, productId: product.id, rating: data.rating, comment: data.comment },
    });

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
