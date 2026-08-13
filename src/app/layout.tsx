import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevDock — Foco & Produtividade',
  description: 'DevDock: Timer Pomodoro, Cronômetro, Gerenciador de Tarefas e Produtividade Sincronizada em Nuvem.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased bg-black text-white font-sans">
        {children}
      </body>
    </html>
  );
}
