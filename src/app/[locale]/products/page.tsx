import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductsPageClient from '@/components/products/ProductsPageClient';
import { ProductGridSkeleton } from '@/components/shared/Skeleton';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return { title: locale === 'ar' ? 'المنتجات - LaptopStore' : 'Products - LaptopStore' };
}

interface SearchParams {
  q?: string;
  category?: string;
  featured?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  brand?: string;
  inStock?: string;
}

async function getProductsData(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };
  if (searchParams.q) {
    where.OR = [
      { nameAr: { contains: searchParams.q, mode: 'insensitive' } },
      { nameEn: { contains: searchParams.q, mode: 'insensitive' } },
      { brand: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }
  if (searchParams.category) where.category = { slug: searchParams.category };
  if (searchParams.featured === 'true') where.isFeatured = true;
  if (searchParams.brand) where.brand = { equals: searchParams.brand, mode: 'insensitive' };
  if (searchParams.inStock === 'true') where.stock = { gt: 0 };
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) (where.price as Record<string, number>).gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) (where.price as Record<string, number>).lte = parseFloat(searchParams.maxPrice);
  }

  const orderBy: Record<string, unknown> = {};
  switch (searchParams.sort) {
    case 'price_asc': orderBy.price = 'asc'; break;
    case 'price_desc': orderBy.price = 'desc'; break;
    case 'featured': orderBy.isFeatured = 'desc'; break;
    default: orderBy.createdAt = 'desc';
  }

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { category: true, _count: { select: { reviews: true } }, reviews: { select: { rating: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.product.groupBy({ by: ['brand'], where: { isActive: true, brand: { not: null } } }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      avgRating: p.reviews.length ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length : 0,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      specsAr: p.specsAr as Record<string, string> | null,
      specsEn: p.specsEn as Record<string, string> | null,
      category: { ...p.category, createdAt: p.category.createdAt.toISOString(), updatedAt: p.category.updatedAt.toISOString() },
    })),
    total,
    totalPages: Math.ceil(total / limit),
    page,
    categories: categories.map((c) => ({ ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() })),
    brands: brands.map((b) => b.brand).filter(Boolean) as string[],
  };
}

export default async function ProductsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const data = await getProductsData(searchParams).catch(() => ({
    products: [], total: 0, totalPages: 1, page: 1, categories: [], brands: [],
  }));

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 min-h-screen">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductsPageClient
            initialData={data as Parameters<typeof ProductsPageClient>[0]['initialData']}
            locale={locale}
            searchParams={searchParams}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
