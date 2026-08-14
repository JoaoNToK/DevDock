'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/context/ThemeContext';
import { InstallPWASection } from '@/components/pwa/InstallPWASection';
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
    hasPermission,
    preferences,
    updatePreferences,
    requestPermission,
  } = useNotifications();

  const { theme, setTheme, isMounted: isThemeMounted } = useTheme();

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
            <p className="text-xs text-secondary-theme font-medium">Personalize a aparência, tempos, áudio e notificações</p>
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

        {/* Push Notification Preferences Card */}
        <div className="p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-primary-theme">
              <Bell className="w-4 h-4 text-secondary-theme" />
              <span>Notificações &amp; Lembretes</span>
            </div>

            {hasPermission ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold theme-card-elevated text-primary-theme border flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-secondary-theme" />
                <span>Permissão Concedida</span>
              </span>
            ) : (
              <button
                onClick={requestPermission}
                className="btn-primary py-1.5 px-3 rounded-xl text-xs shadow-md"
              >
                Ativar Notificações
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-2xl theme-card border cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pomodoroAlerts}
                onChange={(e) => updatePreferences({ pomodoroAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--btn-primary-bg)] focus:ring-[var(--border-color)] accent-[var(--btn-primary-bg)]"
              />
              <span className="text-xs text-primary-theme font-semibold">Notificações do Pomodoro (Fim de foco e pausas)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl theme-card border cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.plannerAlerts}
                onChange={(e) => updatePreferences({ plannerAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--btn-primary-bg)] focus:ring-[var(--border-color)] accent-[var(--btn-primary-bg)]"
              />
              <span className="text-xs text-primary-theme font-semibold">Notificações de Planejamento e compromissos</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl theme-card border cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.reminderAlerts}
                onChange={(e) => updatePreferences({ reminderAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--btn-primary-bg)] focus:ring-[var(--border-color)] accent-[var(--btn-primary-bg)]"
              />
              <span className="text-xs text-primary-theme font-semibold">Lembretes de atividades próximas (10 minutos antes)</span>
            </label>
          </div>
        </div>

        {/* PWA Installation Section */}
        <InstallPWASection />
      </div>
    </MainLayout>
  );
}
