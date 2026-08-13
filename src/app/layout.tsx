import type { Metadata, Viewport } from 'next';
import { Cabin } from 'next/font/google';
import './globals.css';
import { SWRegister } from '@/app/sw-register';

const cabin = Cabin({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cabin',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DevDock — Foco & Produtividade',
  description: 'DevDock: Timer Pomodoro, Cronômetro, Gerenciador de Tarefas, Calendário e Planejamento Sincronizado.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DevDock',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`dark ${cabin.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${cabin.className} antialiased bg-black text-white font-sans`}>
        <SWRegister />
        {children}
      </body>
    </html>
  );
}

