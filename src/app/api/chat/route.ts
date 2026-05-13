import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);

    if (isAdmin) {
      const conversations = await prisma.conversation.findMany({
        orderBy: { lastMessageAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, avatar: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } },
        },
      });
      return NextResponse.json({ conversations });
    }

    let conversation = await prisma.conversation.findFirst({
      where: { userId: session.user.id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { userId: session.user.id },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    return NextResponse.json({ conversation });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { conversationId, content, imageUrl } = body;

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content,
        imageUrl,
        isFromAdmin: isAdmin,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: content || '📷 صورة', lastMessageAt: new Date() },
    });

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
