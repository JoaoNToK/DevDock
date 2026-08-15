'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DevDockBackupFile, RestoreMode } from '@/lib/backup/types';
import { validateBackupFile } from '@/lib/backup/validation';
import { restoreBackupData } from '@/lib/backup/restore';
import { exportBackupToFile } from '@/lib/backup/export';
import {
  X,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ReturnType<typeof validateBackupFile> | null>(null);
  const [restoreMode, setRestoreMode] = useState<RestoreMode>('replace');
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setStatusMessage(null);
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validated = validateBackupFile(content);
      setValidation(validated);
    };
    reader.readAsText(file);
  };

  const handleExportCurrentStateFirst = () => {
    try {
      exportBackupToFile('auto-seguranca');
      setStatusMessage({ type: 'success', text: 'Backup atual exportado com sucesso! Agora você pode restaurar com segurança.' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Erro ao exportar backup prévio: ' + e.message });
    }
  };

  const handleExecuteRestore = () => {
    if (!validation?.parsed || !validation.result.isValid) return;

    setIsRestoring(true);
    setStatusMessage(null);

    setTimeout(() => {
      const res = restoreBackupData(validation.parsed!, restoreMode);
      setIsRestoring(false);

      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    }, 500);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl my-auto p-6 rounded-3xl theme-surface border shadow-2xl space-y-6 relative text-primary-theme">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl theme-card-elevated border">
              <Upload className="w-5 h-5 text-primary-theme" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Importar & Restaurar Backup</h3>
              <p className="text-xs text-secondary-theme font-medium">Selecione e valide um arquivo de backup do DevDock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-secondary-theme hover:text-primary-theme hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Picker */}
        {!selectedFile ? (
          <div className="border-2 border-dashed rounded-3xl p-8 text-center space-y-4 hover:border-zinc-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl theme-card-elevated border flex items-center justify-center mx-auto text-primary-theme">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold">Clique para selecionar seu arquivo de backup</p>
              <p className="text-xs text-secondary-theme mt-1">Aceita arquivos .devDock-backup.json ou .json</p>
            </div>
            <label className="btn-primary py-2.5 px-5 rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-md">
              <Upload className="w-4 h-4" />
              <span>Selecionar Arquivo</span>
              <input
                type="file"
                accept=".json,.devDock-backup.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-5">
            {/* File Selected Badge */}
            <div className="p-3.5 rounded-2xl theme-card border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono truncate">
                <FileCheck className="w-4 h-4 text-primary-theme shrink-0" />
                <span className="truncate font-bold">{selectedFile.name}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setValidation(null);
                  setStatusMessage(null);
                }}
                className="text-xs text-tertiary-theme hover:text-primary-theme underline ml-2"
              >
                Trocar arquivo
              </button>
            </div>

            {/* Validation Errors Display */}
            {validation && !validation.result.isValid && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Arquivo de Backup Inválido</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  {validation.result.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Validation Warnings */}
            {validation && validation.result.warnings.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs space-y-1">
                {validation.result.warnings.map((warn, idx) => (
                  <p key={idx}>⚠️ {warn}</p>
                ))}
              </div>
            )}

            {/* Validation Success & Content Summary */}
            {validation && validation.result.isValid && validation.result.summary && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl theme-card border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-theme uppercase tracking-wider">
                      Resumo dos Dados Encontrados
                    </span>
                    <span className="px-2 py-0.5 rounded-full theme-card-elevated border text-[10px] font-mono text-primary-theme">
                      v{validation.result.version} • {validation.result.exportedAt ? new Date(validation.result.exportedAt).toLocaleDateString('pt-BR') : 'Hoje'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-xl theme-card-elevated border">
                      <span className="text-[10px] text-tertiary-theme block">Projetos</span>
                      <span className="font-mono font-extrabold text-primary-theme">{validation.result.summary.projects}</span>
                    </div>
                    <div className="p-2 rounded-xl theme-card-elevated border">
                      <span className="text-[10px] text-tertiary-theme block">Tarefas</span>
                      <span className="font-mono font-extrabold text-primary-theme">{validation.result.summary.tasks}</span>
                    </div>
                    <div className="p-2 rounded-xl theme-card-elevated border">
                      <span className="text-[10px] text-tertiary-theme block">Eventos</span>
                      <span className="font-mono font-extrabold text-primary-theme">{validation.result.summary.calendarEvents}</span>
                    </div>
                    <div className="p-2 rounded-xl theme-card-elevated border">
                      <span className="text-[10px] text-tertiary-theme block">Atividades</span>
                      <span className="font-mono font-extrabold text-primary-theme">{validation.result.summary.plannerActivities}</span>
                    </div>
                    <div className="p-2 rounded-xl theme-card-elevated border">
                      <span className="text-[10px] text-tertiary-theme block">Matérias</span>
                      <span className="font-mono font-extrabold text-primary-theme">{validation.result.summary.subjects}</span>
                    </div>
                    <div className="p-2 rounded-xl theme-card-elevated border">
                      <span className="text-[10px] text-tertiary-theme block">Sessões Foco</span>
                      <span className="font-mono font-extrabold text-primary-theme">{validation.result.summary.pomodoroRecords}</span>
                    </div>
                  </div>
                </div>

                {/* Restoration Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary-theme block">Estratégia de Restauração</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRestoreMode('replace')}
                      className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                        restoreMode === 'replace' ? 'btn-primary' : 'theme-card text-secondary-theme'
                      }`}
                    >
                      <span className="font-bold block">🔄 Substituir Tudo</span>
                      <span className="text-[10px] opacity-75">Substitui os dados locais pelos dados do arquivo.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRestoreMode('merge')}
                      className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                        restoreMode === 'merge' ? 'btn-primary' : 'theme-card text-secondary-theme'
                      }`}
                    >
                      <span className="font-bold block">➕ Mesclar Dados</span>
                      <span className="text-[10px] opacity-75">Combina com os dados existentes sem apagar.</span>
                    </button>
                  </div>
                </div>

                {/* Auto Safety Export Option */}
                {restoreMode === 'replace' && (
                  <div className="p-3.5 rounded-2xl theme-card border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary-theme" />
                      <span className="text-secondary-theme">Exportar cópia dos dados atuais por segurança?</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportCurrentStateFirst}
                      className="btn-secondary py-1.5 px-3 rounded-xl text-[11px] flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Baixar Cópias</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status Feedback Message */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary py-2.5 px-4 rounded-2xl text-xs font-bold"
              >
                Cancelar
              </button>

              {validation?.result.isValid && (
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={handleExecuteRestore}
                  className="btn-primary py-2.5 px-6 rounded-2xl text-xs shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Restaurando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar & Restaurar</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
