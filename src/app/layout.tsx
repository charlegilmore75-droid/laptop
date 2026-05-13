import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'LaptopStore - متجر اللابتوبات',
    template: '%s | LaptopStore',
  },
  description: 'متجر اللابتوبات الأول - أحدث الموديلات بأفضل الأسعار',
  keywords: ['لابتوب', 'كمبيوتر', 'laptop', 'computer', 'متجر', 'store'],
  openGraph: {
    type: 'website',
    locale: 'ar_SY',
    alternateLocale: 'en_US',
    siteName: 'LaptopStore',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
