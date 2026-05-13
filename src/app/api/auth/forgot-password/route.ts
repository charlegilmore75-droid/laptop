import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/utils';
import { sendPasswordResetEmail } from '@/lib/mailer';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  lang: z.enum(['ar', 'en']).default('ar'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, lang } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/${lang}/auth/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetLink, lang);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
