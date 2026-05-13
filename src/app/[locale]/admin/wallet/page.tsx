import { prisma } from '@/lib/db';
import AdminWalletClient from '@/components/admin/AdminWalletClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Wallet - Admin' };

async function getData() {
  const [topupRequests, settings] = await Promise.all([
    prisma.walletTopupRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, paymentMethod: { select: { nameAr: true, nameEn: true } } },
    }),
    prisma.siteSettings.findUnique({ where: { key: 'walletEnabled' } }),
  ]);
  return {
    topupRequests: topupRequests.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
    walletEnabled: settings?.value === 'true',
  };
}

export default async function AdminWalletPage({ params: { locale } }: { params: { locale: string } }) {
  const data = await getData().catch(() => ({ topupRequests: [], walletEnabled: false }));
  return <AdminWalletClient data={data as Parameters<typeof AdminWalletClient>[0]['data']} locale={locale} />;
}
