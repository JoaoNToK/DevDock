'use client';

import React, { useState } from 'react';
import { exportBackupToFile } from '@/lib/backup/export';
import { BackupModal } from '@/components/backup/BackupModal';
import { Download, Upload, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface BackupSectionProps {
  userName?: string;
}

export const BackupSection: React.FC<BackupSectionProps> = ({ userName }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const res = exportBackupToFile(userName);
      setExportFeedback(`Backup "${res.filename}" exportado com sucesso!`);
      setTimeout(() => setExportFeedback(null), 5000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao exportar backup';
      setExportFeedback(`Erro ao exportar backup: ${msg}`);
    }
  };

  return (
    <div className="p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-primary-theme">Dados e Backup Completo</h3>
          <p className="text-xs text-secondary-theme mt-0.5">
            Exporte uma cópia completa e versionada dos seus dados ou restaure um backup anterior com validação e segurança.
          </p>
        </div>
        <ShieldCheck className="w-6 h-6 text-primary-theme shrink-0" />
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Export Button */}
        <button
          type="button"
          onClick={handleExport}
          className="p-4 rounded-2xl theme-card border hover:border-[var(--text-primary)] text-left transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-primary-theme">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-primary-theme group-hover:scale-110 transition-transform" />
              <span>Exportar Backup</span>
            </div>
            <span className="px-2 py-0.5 rounded-full theme-card-elevated border text-[10px] font-mono">
              .devDock-backup.json
            </span>
          </div>
          <p className="text-[11px] text-secondary-theme leading-relaxed">
            Gera um arquivo seguro contendo todas as suas tarefas, matérias, eventos, projetos, kanban e pomodoros.
          </p>
        </button>

        {/* Import Button */}
        <button
          type="button"
          onClick={() => setIsImportModalOpen(true)}
          className="p-4 rounded-2xl theme-card border hover:border-[var(--text-primary)] text-left transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-primary-theme">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary-theme group-hover:scale-110 transition-transform" />
              <span>Importar & Restaurar</span>
            </div>
            <span className="px-2 py-0.5 rounded-full theme-card-elevated border text-[10px] font-mono">
              Validação v1
            </span>
          </div>
          <p className="text-[11px] text-secondary-theme leading-relaxed">
            Selecione um arquivo de backup para validar, revisar o resumo dos dados e restaurar com opção de substituição ou mesclagem.
          </p>
        </button>
      </div>

      {/* Export Feedback Banner */}
      {exportFeedback && (
        <div className="p-3.5 rounded-2xl theme-card-elevated border text-xs text-primary-theme flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-primary-theme shrink-0" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Import Modal */}
      <BackupModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
