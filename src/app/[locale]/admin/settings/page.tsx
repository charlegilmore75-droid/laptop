import { prisma } from '@/lib/db';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings - Admin' };

async function getSettings() {
  const settings = await prisma.siteSettings.findMany();
  return settings.reduce<Record<string, string | null>>((acc, s) => { acc[s.key] = s.value; return acc; }, {});
}

export default async function AdminSettingsPage({ params: { locale } }: { params: { locale: string } }) {
  const settings = await getSettings().catch(() => ({}));
  return <AdminSettingsClient settings={settings} locale={locale} />;
}
