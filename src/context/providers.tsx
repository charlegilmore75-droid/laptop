'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import type { Session } from 'next-auth';

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
  locale: string;
}

export function Providers({ children, session, locale }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <Toaster
          position={locale === 'ar' ? 'top-right' : 'top-left'}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              fontFamily: locale === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif',
              direction: locale === 'ar' ? 'rtl' : 'ltr',
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
