import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateOTP } from '@/lib/utils';
import { sendOTPEmail } from '@/lib/mailer';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  lang: z.enum(['ar', 'en']).default('ar'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, lang } = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.emailVerified) {
      return NextResponse.json(
        { error: lang === 'ar' ? 'البريد الإلكتروني مسجل مسبقاً' : 'Email already registered' },
        { status: 400 }
      );
    }

    if (!existing) {
      await prisma.user.create({ data: { email } });
    }

    await prisma.oTPCode.deleteMany({ where: { email } });

    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTPCode.create({ data: { email, code: otp, expiresAt } });

    await sendOTPEmail(email, otp, lang);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
