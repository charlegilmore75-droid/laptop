import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  }).catch(() => []);

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  }).catch(() => []);

  const staticPages = ['', '/products', '/cart', '/wishlist', '/compare', '/support'];

  return [
    ...['ar', 'en'].flatMap((locale) =>
      staticPages.map((page) => ({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: page === '' ? 1 : 0.8,
      }))
    ),
    ...products.flatMap((p) =>
      ['ar', 'en'].map((locale) => ({
        url: `${baseUrl}/${locale}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    ),
    ...categories.flatMap((c) =>
      ['ar', 'en'].map((locale) => ({
        url: `${baseUrl}/${locale}/products?category=${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
    ),
  ];
}
