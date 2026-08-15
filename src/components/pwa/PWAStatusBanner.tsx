'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, X } from 'lucide-react';

export const PWAStatusBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for Service Worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true);
                setWaitingWorker(newWorker);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  return (
    <>
      {/* Offline Status Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-amber-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
          <WifiOff className="w-4 h-4" />
          <span>Você está offline. Navegando no modo leitura/local.</span>
        </div>
      )}

      {/* Online Restored Toast */}
      {showOnlineToast && !isOffline && (
        <div className="fixed bottom-5 right-5 z-[200] bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Wifi className="w-4 h-4" />
          <span>Você está online novamente!</span>
        </div>
      )}

      {/* New PWA Version Available Banner */}
      {hasUpdate && (
        <div className="fixed bottom-5 left-5 z-[200] p-4 rounded-2xl bg-zinc-900 border border-indigo-500/40 text-white text-xs shadow-2xl flex items-center gap-3 animate-slide-up">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-sm">Nova versão disponível</p>
            <p className="text-[11px] text-zinc-400">Atualize para obter as últimas melhorias do DevDock.</p>
          </div>
          <button
            onClick={handleUpdate}
            className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-md transition-all ml-2"
          >
            Atualizar agora
          </button>
          <button
            onClick={() => setHasUpdate(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};
