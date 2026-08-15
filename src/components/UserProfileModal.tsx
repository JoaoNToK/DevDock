'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { downloadBackupJSON, parseBackupJSON } from '@/lib/sync/cloudSync';
import {
  X,
  User,
  Cloud,
  Download,
  Upload,
  LogOut,
  ShieldCheck,
  Sparkles,
  Clock,
} from 'lucide-react';

import { CloudUserData } from '@/types/auth';

interface UserProfileModalProps {
  onRestoreCloudData?: (data: CloudUserData) => void;
  currentExportData?: CloudUserData;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  onRestoreCloudData,
  currentExportData,
}) => {
  const { user, isProfileModalOpen, closeProfileModal, logout, getUserCloudData } = useAuth();

  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isProfileModalOpen || !mounted || !user) return null;

  const handleBackupDownload = () => {
    const dataToExport = currentExportData || getUserCloudData() || {
      settings: { focus: 25, shortBreak: 5, longBreak: 15 },
      sessionRecords: [],
      tasks: [],
      totalFocusMinutes: 0,
      completedSessions: 0,
      dailyGoal: 8,
      volume: 0.8,
      lastSyncedAt: Date.now(),
    };

    downloadBackupJSON(dataToExport, user.name);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Carregando...');
      const content = await file.text();
      const restored = parseBackupJSON(content);

      if (onRestoreCloudData) {
        onRestoreCloudData(restored);
      }
      setImportStatus('✅ Backup restaurado com sucesso!');
      setTimeout(() => setImportStatus(null), 3000);
    } catch (err: unknown) {
      setImportStatus('❌ Erro ao ler arquivo de backup');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md my-auto p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={closeProfileModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Fechar perfil"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Identity Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full border-2 border-indigo-500 shadow-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-lg border-2 border-indigo-400/30">
              {getInitials(user.name)}
            </div>
          )}

          <div>
            <h3 className="text-xl font-extrabold text-white">{user.name}</h3>
            <p className="text-xs text-zinc-400 font-mono">{user.email}</p>
          </div>

          {/* Account Provider Badge */}
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>{user.provider === 'google' ? 'Google OAuth' : 'Conta E-mail'}</span>
            </span>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span>Nuvem Sincronizada</span>
            </span>
          </div>
        </div>

        {/* Cloud Sync & Backup Section */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Sincronização &amp; Backup</span>
            </h4>
            <span className="text-[10px] font-mono text-zinc-500">Auto-Sync</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Seus pomodoros, histórico, tarefas e configurações são salvos automaticamente no banco de dados da nuvem.
          </p>

          {importStatus && (
            <div className="text-xs font-semibold text-indigo-300 p-2 rounded-xl bg-indigo-950/80 border border-indigo-800">
              {importStatus}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Download Backup */}
            <button
              onClick={handleBackupDownload}
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Baixar Backup</span>
            </button>

            {/* Restore Backup */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Restaurar</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Criada em {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>

          <button
            onClick={logout}
            className="py-2 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
