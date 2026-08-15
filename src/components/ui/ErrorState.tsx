'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Não foi possível carregar as informações',
  description = 'Ocorreu um problema ao carregar os dados deste módulo. Verifique sua conexão ou tente novamente.',
  onRetry,
  retryLabel = 'Tentar novamente',
  className = '',
}) => {
  return (
    <div
      className={`p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>

      <div className="space-y-1 max-w-md">
        <h4 className="text-sm font-bold text-red-400">{title}</h4>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{description}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
};
