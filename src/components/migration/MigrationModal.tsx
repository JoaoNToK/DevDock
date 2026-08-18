'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { migrateLocalStorageToDatabaseAction } from '@/app/actions/migrationActions';
import { Database, ArrowUpRight, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { STORAGE_KEYS, storageAdapter } from '@/lib/storage';

export const MigrationModal: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      return;
    }

    try {
      const isDone = storageAdapter.getRaw(STORAGE_KEYS.MIGRATION_DONE);
      if (isDone === 'true') return;

      // Check if there is legacy or local content in localStorage
      const projData = storageAdapter.get(STORAGE_KEYS.PROJECTS, storageAdapter.get(STORAGE_KEYS.LEGACY_PROJECTS, null));
      const studData = storageAdapter.get(STORAGE_KEYS.STUDIES, storageAdapter.get(STORAGE_KEYS.LEGACY_STUDIES, null));
      const acadData = storageAdapter.get(STORAGE_KEYS.ACADEMIC, storageAdapter.get(STORAGE_KEYS.LEGACY_ACADEMIC, null));
      const eventData = storageAdapter.get(STORAGE_KEYS.CALENDAR, storageAdapter.get(STORAGE_KEYS.LEGACY_CALENDAR, null));

      if (projData || studData || acadData || eventData) {
        setHasData(true);
        setIsOpen(true);
      }
    } catch (e) {
      console.error('Failed checking migration data:', e);
    }
  }, [user]);

  if (!isOpen || !hasData) return null;

  const handleMigrate = async () => {
    setIsMigrating(true);
    setErrorMessage(null);

    try {
      const projData = storageAdapter.get(STORAGE_KEYS.PROJECTS, storageAdapter.get(STORAGE_KEYS.LEGACY_PROJECTS, []));
      const studData = storageAdapter.get(STORAGE_KEYS.STUDIES, storageAdapter.get(STORAGE_KEYS.LEGACY_STUDIES, []));
      const acadData = storageAdapter.get(STORAGE_KEYS.ACADEMIC, storageAdapter.get(STORAGE_KEYS.LEGACY_ACADEMIC, null));
      const eventData = storageAdapter.get(STORAGE_KEYS.CALENDAR, storageAdapter.get(STORAGE_KEYS.LEGACY_CALENDAR, []));

      const payload = {
        projects: projData,
        studies: studData,
        academic: acadData || undefined,
        events: eventData,
      };

      const result = await migrateLocalStorageToDatabaseAction(payload);

      if (result.success) {
        setSuccessMessage('Dados importados com sucesso para o banco de dados PostgreSQL!');
        storageAdapter.set(STORAGE_KEYS.MIGRATION_DONE, 'true');

        setTimeout(() => {
          setIsOpen(false);
          window.location.reload();
        }, 1500);
      } else if ('error' in result) {
        setErrorMessage(result.error || 'Erro ao importar dados.');
      } else {
        setErrorMessage('Erro ao importar dados.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro na migração de dados.';
      setErrorMessage(msg);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  const handleDiscard = () => {
    storageAdapter.set(STORAGE_KEYS.MIGRATION_DONE, 'true');
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl theme-surface border shadow-2xl space-y-6 relative">
        <button
          onClick={handleSkip}
          className="absolute top-5 right-5 p-2 rounded-xl text-secondary-theme hover:text-primary-theme hover:bg-zinc-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl theme-card-elevated border text-primary-theme">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-primary-theme">Dados Locais Encontrados</h3>
            <p className="text-xs text-secondary-theme font-medium">Sincronização com sua conta no DevDock</p>
          </div>
        </div>

        <p className="text-xs text-secondary-theme leading-relaxed">
          Encontramos dados de projetos, estudos e planejamento salvos localmente neste navegador. Deseja importar este conteúdo para a sua conta oficial no DevDock?
        </p>

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="btn-primary w-full sm:flex-1 py-3 px-4 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{isMigrating ? 'Importando...' : 'Importar Dados Agora'}</span>
          </button>

          <button
            onClick={handleSkip}
            disabled={isMigrating}
            className="btn-secondary w-full sm:w-auto py-3 px-4 rounded-2xl font-semibold text-xs"
          >
            Agora não
          </button>

          <button
            onClick={handleDiscard}
            disabled={isMigrating}
            className="text-[11px] text-red-400 hover:underline px-2 py-1"
          >
            Descartar dados locais
          </button>
        </div>
      </div>
    </div>
  );
};
