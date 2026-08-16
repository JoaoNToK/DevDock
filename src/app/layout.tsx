import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SWRegister } from '@/app/sw-register';
import { ThemeProvider } from '@/context/ThemeContext';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';
import { PWAStatusBanner } from '@/components/pwa/PWAStatusBanner';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'DevDock — Foco & Produtividade',
  description: 'Plataforma de produtividade e organização: Pomodoro, Cronômetro, Tarefas, Calendário e Planejamento.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DevDock',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased font-sans">
        <NextAuthProvider>
          <ThemeProvider>
            <SWRegister />
            <PWAStatusBanner />
            {children}
            <SpeedInsights />
            <Analytics />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
