import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategorySection from '@/components/home/CategorySection';
import SpecialOffers from '@/components/home/SpecialOffers';
import { ProductGridSkeleton } from '@/components/shared/Skeleton';
import type { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'الرئيسية - LaptopStore' : 'Home - LaptopStore',
  };
}

async function getHomeData() {
  const [banners, featuredProducts, categories, offersProducts] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({
      where: { discountPrice: { not: null }, isActive: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),
  ]);

  const enrichProducts = (products: typeof featuredProducts) =>
    products.map((p) => ({
      ...p,
      avgRating: p.reviews.length > 0
        ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length
        : 0,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      specsAr: p.specsAr as Record<string, string> | null,
      specsEn: p.specsEn as Record<string, string> | null,
      category: {
        ...p.category,
        createdAt: p.category.createdAt.toISOString(),
        updatedAt: p.category.updatedAt.toISOString(),
      },
    }));

  return {
    banners: banners.map((b) => ({ ...b, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() })),
    featuredProducts: enrichProducts(featuredProducts),
    categories: categories.map((c) => ({ ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() })),
    offersProducts: enrichProducts(offersProducts),
  };
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'products' });
  const data = await getHomeData().catch(() => ({
    banners: [],
    featuredProducts: [],
    categories: [],
    offersProducts: [],
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <HeroSection banners={data.banners as Parameters<typeof HeroSection>[0]['banners']} />

        {/* Categories */}
        {data.categories.length > 0 && (
          <Suspense>
            <CategorySection categories={data.categories} locale={locale} />
          </Suspense>
        )}

        {/* Featured Products */}
        <section className="container mx-auto px-4 py-16">
          <SectionHeader
            title={locale === 'ar' ? 'منتجات مميزة' : 'Featured Products'}
            link={`/${locale}/products?featured=true`}
            linkText={locale === 'ar' ? 'عرض الكل' : 'View All'}
          />
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <FeaturedProducts products={data.featuredProducts as Parameters<typeof FeaturedProducts>[0]['products']} />
          </Suspense>
        </section>

        {/* Special Offers */}
        {data.offersProducts.length > 0 && (
          <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16">
            <div className="container mx-auto px-4">
              <SectionHeader
                title={locale === 'ar' ? 'عروض خاصة' : 'Special Offers'}
                link={`/${locale}/products?offers=true`}
                linkText={locale === 'ar' ? 'عرض الكل' : 'View All'}
                light
              />
              <Suspense fallback={<ProductGridSkeleton count={6} />}>
                <SpecialOffers products={data.offersProducts as Parameters<typeof SpecialOffers>[0]['products']} />
              </Suspense>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '500+', label: locale === 'ar' ? 'منتج متوفر' : 'Products Available' },
              { value: '10K+', label: locale === 'ar' ? 'عميل سعيد' : 'Happy Customers' },
              { value: '50+', label: locale === 'ar' ? 'ماركة عالمية' : 'Global Brands' },
              { value: '24/7', label: locale === 'ar' ? 'دعم متواصل' : 'Continuous Support' },
            ].map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all">
                <div className="text-3xl lg:text-4xl font-black text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SectionHeader({
  title, link, linkText, light,
}: {
  title: string; link: string; linkText: string; light?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className={`text-2xl lg:text-3xl font-black ${light ? 'text-white' : 'text-foreground'}`}>{title}</h2>
      <a
        href={link}
        className={`text-sm font-semibold ${light ? 'text-white/80 hover:text-white' : 'text-primary hover:text-primary/80'} transition-colors`}
      >
        {linkText} →
      </a>
    </div>
  );
}
