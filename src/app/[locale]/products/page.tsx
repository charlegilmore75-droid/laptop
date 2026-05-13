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
    description:
      params.locale === 'ar'
        ? product.descriptionAr || ''
        : product.descriptionEn || '',
  };
}

async function getProduct(id: string) {
  return prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }], isActive: true },
    include: {
      category: true,
      reviews: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
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
    include: {
      category: true,
      reviews: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { reviews: true } },
    },
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.id).catch(() => null);
  if (!product) notFound();

  const related = await getRelated(product.categoryId, product.id).catch(
    () => []
  );

  // ✅ safe avg rating
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((a, r) => a + r.rating, 0) /
        product.reviews.length
      : 0;

  // ✅ SAFE serializer (fix null vs undefined + Prisma mismatch)
  const serialize = (p: any) => ({
    ...p,
    avgRating,
    specsAr: p.specsAr ?? null,
    specsEn: p.specsEn ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: p.category
      ? {
          ...p.category,
          createdAt: p.category.createdAt.toISOString(),
          updatedAt: p.category.updatedAt.toISOString(),
        }
      : null,
    reviews: (p.reviews || []).map((r: any) => ({
      id: r.id,
      userId: r.userId,
      productId: r.productId,
      rating: r.rating,
      comment: r.comment ?? null,
      isApproved: r.isApproved,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      user: {
        name: r.user?.name ?? undefined,
        avatar: r.user?.avatar ?? undefined,
      },
    })),
  });

  // ✅ safe related serializer
  const serializeRelated = (items: any[]) =>
    (items || []).map((r) => {
      const ratings = r.reviews || [];

      const avg =
        ratings.length > 0
          ? ratings.reduce((a: number, b: any) => a + b.rating, 0) /
            ratings.length
          : 0;

      return {
        ...r,
        avgRating: avg,
        specsAr: r.specsAr ?? null,
        specsEn: r.specsEn ?? null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        category: r.category
          ? {
              ...r.category,
              createdAt: r.category.createdAt.toISOString(),
              updatedAt: r.category.updatedAt.toISOString(),
            }
          : null,
      };
    });

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 min-h-screen">
        <ProductDetailClient
          product={serialize(product)}
          related={serializeRelated(related)}
          locale={params.locale}
        />
      </main>
      <Footer />
    </>
  );
}
