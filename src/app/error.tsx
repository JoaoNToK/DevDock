'use client';

import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors safely
    console.error('[DevDock Root Error Boundary]:', error);
  }, [error]);

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
            Ops! Algo não saiu como esperado
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Não foi possível carregar as informações desta página. Nossos dados locais estão protegidos e você pode tentar recarregar.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="btn-primary py-2.5 px-5 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tentar novamente</span>
          </button>

          <Link
            href="/"
            className="btn-secondary py-2.5 px-5 rounded-2xl text-xs font-semibold flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
