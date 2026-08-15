'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/context/ThemeContext';
import { InstallPWASection } from '@/components/pwa/InstallPWASection';
import { BackupSection } from '@/components/backup/BackupSection';
import {
  Settings,
  Clock,
  Volume2,
  Bell,
  Target,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const {
    settings,
    volume,
    dailyGoal,
    isMounted: isTimerMounted,
    updateSettings,
    setVolume,
    setDailyGoal,
  } = usePomodoroTimer();

  const {
    permission,
    hasPermission,
    isSubscribed,
    isLoading: isNotificationLoading,
    preferences,
    updatePreferences,
    requestPermission,
    triggerTestNotification,
  } = useNotifications();

  const { theme, setTheme, isMounted: isThemeMounted } = useTheme();

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await triggerTestNotification();
      if (res?.success) {
        setTestResult({ success: true, message: 'Notificação enviada por Web Push com sucesso!' });
      } else {
        setTestResult({ success: false, message: res?.error || 'Não foi possível enviar a notificação.' });
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Erro ao enviar notificação.';
      setTestResult({ success: false, message: errorMsg });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isTimerMounted || !isThemeMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--border-color)] border-t-[var(--text-primary)] animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl flex items-center gap-3">
          <div className="p-2.5 rounded-2xl theme-card-elevated border text-primary-theme">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-primary-theme">Configurações do DevDock</h2>
            <p className="text-xs text-secondary-theme font-medium">Personalize a aparência, tempos, áudio, notificações e PWA</p>
          </div>
        </div>

        {/* Aparência & Tema Card */}
        <div className="p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-primary-theme">Aparência</h3>
            <p className="text-xs text-secondary-theme mt-0.5">Escolha como o DevDock deve aparecer na sua tela.</p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-secondary-theme block">Tema</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Claro */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  theme === 'light'
                    ? 'btn-primary shadow-lg'
                    : 'theme-card text-secondary-theme hover:text-primary-theme'
                }`}
              >
                <Sun className="w-5 h-5" />
                <div>
                  <span className="text-xs block font-bold">☀️ Claro</span>
                  <span className="text-[10px] opacity-75">Modo Clean claro</span>
                </div>
              </button>

              {/* Escuro */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  theme === 'dark'
                    ? 'btn-primary shadow-lg'
                    : 'theme-card text-secondary-theme hover:text-primary-theme'
                }`}
              >
                <Moon className="w-5 h-5" />
                <div>
                  <span className="text-xs block font-bold">🌙 Escuro</span>
                  <span className="text-[10px] opacity-75">Modo Black minimalista</span>
                </div>
              </button>

              {/* Sistema */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  theme === 'system'
                    ? 'btn-primary shadow-lg'
                    : 'theme-card text-secondary-theme hover:text-primary-theme'
                }`}
              >
                <Laptop className="w-5 h-5" />
                <div>
                  <span className="text-xs block font-bold">💻 Sistema</span>
                  <span className="text-[10px] opacity-75">Sincronizado com o SO</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Timer Settings Card */}
        <div className="p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-primary-theme">
            <Clock className="w-4 h-4 text-secondary-theme" />
            <span>Durações do Timer (Minutos)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-secondary-theme block">Tempo de Foco</label>
              <input
                type="number"
                min={1}
                max={120}
                value={settings.focus}
                onChange={(e) => updateSettings({ focus: Number(e.target.value) })}
                className="w-full py-2.5 px-3.5 rounded-2xl theme-input font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[var(--border-color)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-secondary-theme block">Pausa Curta</label>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.shortBreak}
                onChange={(e) => updateSettings({ shortBreak: Number(e.target.value) })}
                className="w-full py-2.5 px-3.5 rounded-2xl theme-input font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[var(--border-color)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-secondary-theme block">Pausa Longa</label>
              <input
                type="number"
                min={1}
                max={90}
                value={settings.longBreak}
                onChange={(e) => updateSettings({ longBreak: Number(e.target.value) })}
                className="w-full py-2.5 px-3.5 rounded-2xl theme-input font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[var(--border-color)]"
              />
            </div>
          </div>
        </div>

        {/* Volume & Goal Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-primary-theme">
                <Volume2 className="w-4 h-4 text-secondary-theme" />
                <span>Volume dos Alertas</span>
              </div>
              <span className="font-mono text-xs font-bold text-primary-theme">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-[var(--text-primary)] cursor-pointer"
            />
          </div>

          <div className="p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-primary-theme">
                <Target className="w-4 h-4 text-secondary-theme" />
                <span>Meta Diária</span>
              </div>
              <span className="font-mono text-xs font-bold text-primary-theme">
                {dailyGoal} Pomodoros
              </span>
            </div>

            <input
              type="number"
              min={1}
              max={30}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full py-2.5 px-3.5 rounded-2xl theme-input font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[var(--border-color)]"
            />
          </div>
        </div>

        {/* Web Push Notification Preferences Card */}
        <div className="p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-primary-theme">
              <Bell className="w-4 h-4 text-secondary-theme" />
              <span>Notificações &amp; Web Push</span>
            </div>

            <div className="flex items-center gap-2">
              {permission === 'granted' ? (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold theme-card-elevated text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>● Ativadas {isSubscribed && '(Web Push PushManager)'}</span>
                </span>
              ) : permission === 'denied' ? (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold theme-card-elevated text-red-400 border border-red-500/30 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Bloqueadas no Navegador</span>
                </span>
              ) : (
                <button
                  onClick={requestPermission}
                  disabled={isNotificationLoading}
                  className="btn-primary py-1.5 px-3 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Ativar Notificações</span>
                </button>
              )}

              {hasPermission && (
                <button
                  onClick={handleTestNotification}
                  disabled={isTesting}
                  className="py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTesting ? 'Enviando...' : 'Testar Notificação'}</span>
                </button>
              )}
            </div>
          </div>

          {permission === 'denied' && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs leading-relaxed">
              ⚠️ As notificações foram bloqueadas no seu navegador. Para ativá-las, clique no ícone de cadeado na barra de endereços e altere a permissão de <strong>Notificações</strong> para <strong>Permitir</strong>.
            </div>
          )}

          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Granular Toggles by Module */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-2xl theme-card border cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(preferences.pomodoroAlerts)}
                onChange={(e) => updatePreferences({ pomodoroAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--btn-primary-bg)] focus:ring-[var(--border-color)] accent-[var(--btn-primary-bg)]"
              />
              <span className="text-xs text-primary-theme font-semibold">🍅 Notificações do Pomodoro</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl theme-card border cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(preferences.calendarAlerts)}
                onChange={(e) => updatePreferences({ calendarAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--btn-primary-bg)] focus:ring-[var(--border-color)] accent-[var(--btn-primary-bg)]"
              />
              <span className="text-xs text-primary-theme font-semibold">📅 Eventos do Calendário</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl theme-card border cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(preferences.plannerAlerts)}
                onChange={(e) => updatePreferences({ plannerAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--btn-primary-bg)] focus:ring-[var(--border-color)] accent-[var(--btn-primary-bg)]"
              />
              <span className="text-xs text-primary-theme font-semibold">📋 Planejamento Diário &amp; Semanal</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl theme-card border cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(preferences.taskAlerts)}
                onChange={(e) => updatePreferences({ taskAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--btn-primary-bg)] focus:ring-[var(--border-color)] accent-[var(--btn-primary-bg)]"
              />
              <span className="text-xs text-primary-theme font-semibold">✅ Gerenciador de Tarefas</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl theme-card border cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(preferences.studyAlerts)}
                onChange={(e) => updatePreferences({ studyAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--btn-primary-bg)] focus:ring-[var(--border-color)] accent-[var(--btn-primary-bg)]"
              />
              <span className="text-xs text-primary-theme font-semibold">📚 Estudos &amp; Revisões</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl theme-card border cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(preferences.projectAlerts)}
                onChange={(e) => updatePreferences({ projectAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--btn-primary-bg)] focus:ring-[var(--border-color)] accent-[var(--btn-primary-bg)]"
              />
              <span className="text-xs text-primary-theme font-semibold">🚀 Projetos &amp; Kanban</span>
            </label>
          </div>
        </div>

        {/* PWA Installation Section */}
        <InstallPWASection />

        {/* Backup & Restore Section */}
        <BackupSection />
      </div>
    </MainLayout>
  );
}
