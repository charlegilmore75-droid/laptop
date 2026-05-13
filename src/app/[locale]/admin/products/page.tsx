import { prisma } from '@/lib/db';
import AdminProductsClient from '@/components/admin/AdminProductsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Products - Admin' };

async function getData() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true, _count: { select: { reviews: true, orderItems: true } } },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ]);
  return {
    products: products.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(), specsAr: p.specsAr as Record<string, string> | null, specsEn: p.specsEn as Record<string, string> | null, category: { ...p.category, createdAt: p.category.createdAt.toISOString(), updatedAt: p.category.updatedAt.toISOString() } })),
    categories: categories.map((c) => ({ ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() })),
  };
}

export default async function AdminProductsPage({ params: { locale } }: { params: { locale: string } }) {
  const data = await getData().catch(() => ({ products: [], categories: [] }));
  return <AdminProductsClient data={data as Parameters<typeof AdminProductsClient>[0]['data']} locale={locale} />;
}
