import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(8),
  confirmPassword: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, password, confirmPassword } = schema.parse(body);

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'كلمات المرور غير متطابقة' }, { status: 400 });
    }

    const otpRecord = await prisma.oTPCode.findFirst({
      where: { email, code: otp, used: false, expiresAt: { gt: new Date() } },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'كود غير صالح أو منتهي الصلاحية' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.upsert({
        where: { email },
        update: { passwordHash, emailVerified: new Date() },
        create: { email, passwordHash, emailVerified: new Date() },
      }),
      prisma.oTPCode.update({ where: { id: otpRecord.id }, data: { used: true } }),
    ]);

    await prisma.wallet.upsert({
      where: { userId: (await prisma.user.findUnique({ where: { email } }))!.id },
      update: {},
      create: {
        userId: (await prisma.user.findUnique({ where: { email } }))!.id,
        balance: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
