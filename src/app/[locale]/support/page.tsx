import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWindow from '@/components/chat/ChatWindow';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return { title: locale === 'ar' ? 'الدعم الفني - LaptopStore' : 'Support - LaptopStore' };
}

export default async function SupportPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/${locale}/auth/login`);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-6">
            {locale === 'ar' ? 'الدعم الفني' : 'Technical Support'}
          </h1>
          <ChatWindow locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
