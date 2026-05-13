import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Providers } from '@/context/providers';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' });

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: { default: 'LaptopStore', template: '%s | LaptopStore' },
    description: locale === 'ar' ? 'متجر اللابتوبات الأول' : 'Your Premier Laptop Store',
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as 'ar' | 'en')) notFound();

  const messages = await getMessages();
  const session = await getServerSession(authOptions);
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        {isRTL && (
          <link
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
        )}
      </head>
      <body
        className={`${inter.variable} min-h-screen bg-background text-foreground antialiased`}
        style={{ fontFamily: isRTL ? '"Cairo", sans-serif' : '"Inter", sans-serif' }}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers session={session} locale={locale}>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
