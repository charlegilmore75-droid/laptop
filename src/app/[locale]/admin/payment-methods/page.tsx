import { prisma } from '@/lib/db';
import AdminPaymentMethodsClient from '@/components/admin/AdminPaymentMethodsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Payment Methods - Admin' };

export default async function AdminPaymentMethodsPage({ params: { locale } }: { params: { locale: string } }) {
  const methods = await prisma.paymentMethod.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []);
  return <AdminPaymentMethodsClient methods={methods.map((m) => ({ ...m, createdAt: m.createdAt.toISOString(), updatedAt: m.updatedAt.toISOString() }))} locale={locale} />;
}
