'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DevDock Global Error]:', error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-white min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Erro Crítico de Aplicação
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ocorreu uma falha no nível global da aplicação. Seus dados no DevDock estão seguros.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full py-3 px-6 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recarregar Aplicação</span>
          </button>
        </div>
      </body>
    </html>
  );
}
