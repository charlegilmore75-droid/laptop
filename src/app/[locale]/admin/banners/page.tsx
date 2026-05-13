import { prisma } from '@/lib/db';
import AdminBannersClient from '@/components/admin/AdminBannersClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Banners - Admin' };

async function getBanners() {
  return prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
}

export default async function AdminBannersPage({ params: { locale } }: { params: { locale: string } }) {
  const banners = await getBanners().catch(() => []);
  return <AdminBannersClient banners={banners.map((b) => ({ ...b, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() }))} locale={locale} />;
}
