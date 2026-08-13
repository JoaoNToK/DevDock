'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { Menu, User, Timer, Download } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface MainLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

function MainLayoutContent({ children, hideSidebar = false }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, openAuthModal, openProfileModal } = useAuth();
  const { canInstall, promptInstall } = usePWAInstall();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (hideSidebar) {
    return (
      <div className="min-h-screen bg-black text-white w-full">
        {children}
        <AuthModal />
        <UserProfileModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Navbar / Header for Mobile & Desktop */}
        <header className="w-full h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Left: Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 lg:hidden"
              aria-label="Abrir menu lateral"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <div className="p-1 rounded-lg bg-zinc-900 border border-zinc-800/80 shadow-md flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="DevDock Logo"
                  className="w-6 h-6 object-contain rounded-md"
                />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                DevDock
              </span>
            </div>
          </div>

          {/* Right: Actions (PWA Install Button & User Profile) */}
          <div className="flex items-center gap-2">
            {canInstall && (
              <button
                onClick={promptInstall}
                className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-semibold text-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar App</span>
              </button>
            )}

            {user ? (
              <button
                onClick={openProfileModal}
                title={`Conectado como ${user.name}`}
                className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-all"
              >
                <div className="relative">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-indigo-500"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-950" />
                </div>
                <span className="hidden sm:inline font-bold text-white max-w-[120px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <UserProfileModal />
    </div>
  );
}

export function MainLayout({ children, hideSidebar = false }: MainLayoutProps) {
  return (
    <AuthProvider>
      <MainLayoutContent hideSidebar={hideSidebar}>{children}</MainLayoutContent>
    </AuthProvider>
  );
}
