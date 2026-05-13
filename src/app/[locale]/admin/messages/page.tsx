import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminMessagesClient from '@/components/admin/AdminMessagesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Messages - Admin' };

async function getConversations() {
  return prisma.conversation.findMany({
    orderBy: { lastMessageAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, avatar: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
}

export default async function AdminMessagesPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  const conversations = await getConversations().catch(() => []);
  return (
    <AdminMessagesClient
      conversations={conversations.map((c) => ({ ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(), lastMessageAt: c.lastMessageAt?.toISOString() || null, messages: c.messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })) }))}
      adminId={session?.user?.id || ''}
      locale={locale}
    />
  );
}
