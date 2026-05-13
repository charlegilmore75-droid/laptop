import { prisma } from '@/lib/db';
import AdminUsersClient from '@/components/admin/AdminUsersClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Users - Admin' };

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
      wallet: { select: { balance: true } },
    },
  });
  return users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() }));
}

export default async function AdminUsersPage({ params: { locale } }: { params: { locale: string } }) {
  const users = await getUsers().catch(() => []);
  return <AdminUsersClient users={users as Parameters<typeof AdminUsersClient>[0]['users']} locale={locale} />;
}
