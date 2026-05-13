import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/${locale}/auth/login`);
  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) redirect(`/${locale}`);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar locale={locale} />
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
