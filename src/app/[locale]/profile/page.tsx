import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProfileClient from '@/components/profile/ProfileClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Profile - LaptopStore' };

export default async function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, address: true, avatar: true, role: true },
  }).catch(() => null);

  if (!user) redirect(`/${locale}/auth/login`);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 min-h-screen">
        <ProfileClient user={user} locale={locale} />
      </main>
      <Footer />
    </>
  );
}
