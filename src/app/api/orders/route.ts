import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { orderSchema } from '@/lib/validations';
import { sendOrderConfirmationEmail } from '@/lib/mailer';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: { include: { product: { select: { nameAr: true, nameEn: true, thumbnail: true, images: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = orderSchema.parse(body);

    let totalAmount = 0;
    const itemsWithPrices = await Promise.all(
      data.items.map(async (item) => {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) throw new Error(`منتج غير متوفر: ${item.productId}`);
        const price = product.discountPrice ?? product.price;
        totalAmount += price * item.quantity;
        return { productId: item.productId, quantity: item.quantity, price };
      })
    );

    let discountAmount = 0;
    let couponId: string | null = null;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode, isActive: true },
      });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (coupon.discountType === 'PERCENT') {
          discountAmount = (totalAmount * coupon.discountValue) / 100;
        } else {
          discountAmount = Math.min(coupon.discountValue, totalAmount);
        }
        totalAmount -= discountAmount;
        couponId = coupon.id;
      }
    }

    let paidFromWallet = false;
    let walletAmountUsed = 0;
    if (data.useWallet) {
      const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });
      const settings = await prisma.siteSettings.findUnique({ where: { key: 'walletEnabled' } });
      if (wallet && settings?.value === 'true' && wallet.balance >= totalAmount) {
        paidFromWallet = true;
        walletAmountUsed = totalAmount;
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          shippingBranch: data.shippingBranch,
          totalAmount,
          paidFromWallet,
          walletAmountUsed: walletAmountUsed || null,
          discountAmount: discountAmount || null,
          couponId,
          items: { create: itemsWithPrices },
        },
        include: { items: true },
      });

      for (const item of itemsWithPrices) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (paidFromWallet) {
        const wallet = await tx.wallet.findUnique({ where: { userId: session.user.id } });
        await tx.wallet.update({
          where: { userId: session.user.id },
          data: { balance: { decrement: walletAmountUsed } },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: wallet!.id,
            amount: -walletAmountUsed,
            type: 'purchase',
            description: `طلب #${newOrder.id}`,
            referenceId: newOrder.id,
          },
        });
      }

      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      }

      await tx.notification.create({
        data: {
          userId: session.user.id,
          titleAr: `تم استلام طلبك #${newOrder.id.slice(-6)}`,
          titleEn: `Order received #${newOrder.id.slice(-6)}`,
          bodyAr: 'سيتم معالجة طلبك قريباً',
          bodyEn: 'Your order will be processed soon',
          link: `/ar/orders`,
        },
      });

      return newOrder;
    });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.email) {
      sendOrderConfirmationEmail(user.email, order.id, 'ar').catch(console.error);
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
