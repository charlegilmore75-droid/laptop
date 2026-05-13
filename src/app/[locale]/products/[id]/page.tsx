import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string; id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
  }).catch(() => null);
  if (!product) return {};
  return {
    title: params.locale === 'ar' ? product.nameAr : product.nameEn,
    description: params.locale === 'ar' ? product.descriptionAr || '' : product.descriptionEn || '',
  };
}

async function getProduct(id: string) {
  return prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }], isActive: true },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { reviews: true } },
    },
  });
}

async function getRelated(categoryId: string, excludeId: string) {
  return prisma.product.findMany({
    where: { categoryId, isActive: true, id: { not: excludeId } },
    take: 4,
    include: { category: true, _count: { select: { reviews: true } }, reviews: { select: { rating: true } } },
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.id).catch(() => null);
  if (!product) notFound();

  const related = await getRelated(product.categoryId, product.id).catch(() => []);
  const avgRating = product.reviews.length
    ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length : 0;

  const serialize = (p: typeof product) => ({
    ...p,
    avgRating,
    specsAr: p.specsAr as Record<string, string> | null,
    specsEn: p.specsEn as Record<string, string> | null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: { ...p.category, createdAt: p.category.createdAt.toISOString(), updatedAt: p.category.updatedAt.toISOString() },
    reviews: p.reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
  });

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 min-h-screen">
        <ProductDetailClient
          product={serialize(product) as Parameters<typeof ProductDetailClient>[0]['product']}
          related={related.map((r) => ({ ...r, avgRating: r.reviews.length ? r.reviews.reduce((a, rv) => a + rv.rating, 0) / r.reviews.length : 0, specsAr: r.specsAr as Record<string, string> | null, specsEn: r.specsEn as Record<string, string> | null, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(), category: { ...r.category, createdAt: r.category.createdAt.toISOString(), updatedAt: r.category.updatedAt.toISOString() } })) as Parameters<typeof ProductDetailClient>[0]['related']}
          locale={params.locale}
        />
      </main>
      <Footer />
    </>
  );
}
