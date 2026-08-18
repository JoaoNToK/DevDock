'use client';

import React from 'react';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { RefreshCw, Zap, WifiOff, AlertTriangle } from 'lucide-react';

export const SyncStatusIndicator: React.FC = () => {
  const { isAuthenticated, syncState, triggerSync } = useCloudSync();
  const { isRealtimeActive } = useRealtimeSync();

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={() => triggerSync()}
      title="Status da Sincronização em Tempo Real na Nuvem"
      className="flex items-center gap-1.5 py-1 px-2.5 rounded-full theme-surface border text-[11px] font-bold font-mono transition-all hover:scale-105"
    >
      {syncState === 'synced' && (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400">
            {isRealtimeActive ? '⚡ Tempo Real' : 'Sincronizado'}
          </span>
        </>
      )}

      {syncState === 'syncing' && (
        <>
          <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
          <span className="text-cyan-400">Sincronizando...</span>
        </>
      )}

      {syncState === 'offline' && (
        <>
          <WifiOff className="w-3 h-3 text-amber-400" />
          <span className="text-amber-400">Offline</span>
        </>
      )}

      {syncState === 'error' && (
        <>
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-red-400">Erro de Sync</span>
        </>
      )}
    </button>
  );
};
