import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code, orderTotal } = await req.json();

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!coupon) return NextResponse.json({ error: 'كوبون غير صالح' }, { status: 400 });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return NextResponse.json({ error: 'الكوبون منتهي الصلاحية' }, { status: 400 });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: 'تجاوز الحد الأقصى للاستخدام' }, { status: 400 });
    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) return NextResponse.json({ error: `الحد الأدنى للطلب ${coupon.minOrderValue}` }, { status: 400 });

    const alreadyUsed = await prisma.couponUsage.findUnique({
      where: { couponId_userId: { couponId: coupon.id, userId: session.user.id } },
    });
    if (alreadyUsed) return NextResponse.json({ error: 'استخدمت هذا الكوبون مسبقاً' }, { status: 400 });

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENT') {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, orderTotal);
    }

    return NextResponse.json({ coupon, discountAmount, finalTotal: orderTotal - discountAmount });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
