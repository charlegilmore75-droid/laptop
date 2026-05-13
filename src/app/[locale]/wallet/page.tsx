import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WalletClient from '@/components/wallet/WalletClient';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return { title: locale === 'ar' ? 'محفظتي - LaptopStore' : 'My Wallet - LaptopStore' };
}

async function getWalletData(userId: string) {
  const [wallet, transactions, topupRequests, paymentMethods, settings] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.walletTransaction.findMany({
      where: { wallet: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.walletTopupRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { paymentMethod: { select: { nameAr: true, nameEn: true } } },
    }),
    prisma.paymentMethod.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { key: 'walletEnabled' } }),
  ]);
  return {
    wallet,
    transactions: transactions.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
    topupRequests: topupRequests.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    paymentMethods,
    walletEnabled: settings?.value === 'true',
  };
}

export default async function WalletPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const data = await getWalletData(session.user.id).catch(() => ({
    wallet: null, transactions: [], topupRequests: [], paymentMethods: [], walletEnabled: false,
  }));

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 min-h-screen">
        <WalletClient data={data as Parameters<typeof WalletClient>[0]['data']} locale={locale} />
      </main>
      <Footer />
    </>
  );
}
