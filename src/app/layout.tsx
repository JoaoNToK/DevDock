import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SWRegister } from '@/app/sw-register';

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
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased bg-black text-white font-sans">
        <SWRegister />
        {children}
      </body>
    </html>
  );
}
