'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Timer, BarChart3, Settings, Sparkles, User, Cloud } from 'lucide-react';

interface HeaderProps {
  onEnterZenMode: () => void;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onEnterZenMode,
  onOpenAnalytics,
  onOpenSettings,
}) => {
  const { user, openAuthModal, openProfileModal } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="w-full max-w-5xl flex items-center justify-between py-4 px-4 sm:px-6 mb-6 rounded-2xl bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 transition-colors duration-300">
      {/* App Branding */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
          <Timer className="w-6 h-6 animate-pulse-subtle" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Pomodoro
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Foco &amp; Produtividade
          </p>
        </div>
      </div>

      {/* Header Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* User Account / Login Button */}
        {user ? (
          <button
            onClick={openProfileModal}
            title={`Conectado como ${user.name} (Sincronizado na Nuvem)`}
            className="flex items-center gap-2 py-1.5 px-2.5 sm:px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-indigo-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {getInitials(user.name)}
                </div>
              )}
              {/* Online Cloud Sync Dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
            </div>
            <span className="hidden sm:inline font-semibold text-xs text-white max-w-[100px] truncate">
              {user.name.split(' ')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={openAuthModal}
            title="Fazer Login ou Cadastrar-se"
            className="flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Entrar</span>
          </button>
        )}

        {/* Modo Minimalista (Zen) */}
        <button
          onClick={onEnterZenMode}
          aria-label="Ativar Modo Minimalista"
          title="Modo Minimalista (Zen)"
          className="flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs border border-zinc-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Modo Zen</span>
        </button>

        {/* Estatísticas */}
        <button
          onClick={onOpenAnalytics}
          aria-label="Abrir estatísticas e histórico"
          title="Estatísticas &amp; Produtividade"
          className="flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs border border-zinc-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:scale-105 active:scale-95"
        >
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Estatísticas</span>
        </button>

        {/* Configurações */}
        <button
          onClick={onOpenSettings}
          aria-label="Abrir configurações"
          title="Configurações &amp; Áudio"
          className="flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs border border-zinc-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:scale-105 active:scale-95"
        >
          <Settings className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Configurações</span>
        </button>
      </div>
    </header>
  );
};
