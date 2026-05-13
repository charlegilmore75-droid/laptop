import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import OrdersClient from '@/components/orders/OrdersClient';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return { title: locale === 'ar' ? 'طلباتي - LaptopStore' : 'My Orders - LaptopStore' };
}

async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: { select: { nameAr: true, nameEn: true, thumbnail: true, images: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function OrdersPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const orders = await getOrders(session.user.id).catch(() => []);
  const serialized = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((i) => ({ ...i, product: i.product })),
  }));

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 min-h-screen">
        <OrdersClient orders={serialized as Parameters<typeof OrdersClient>[0]['orders']} locale={locale} />
      </main>
      <Footer />
    </>
  );
}
