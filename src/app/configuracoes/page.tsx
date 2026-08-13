'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { useNotifications } from '@/hooks/useNotifications';
import { InstallPWASection } from '@/components/pwa/InstallPWASection';
import {
  Settings,
  Clock,
  Volume2,
  Bell,
  Target,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const {
    settings,
    volume,
    dailyGoal,
    isMounted,
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

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Configurações da Aplicação</h2>
            <p className="text-xs text-zinc-400 font-medium">Personalize tempos, áudio, PWA e notificações</p>
          </div>
        </div>

        {/* Timer Settings Card */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Durações do Timer (Minutos)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Tempo de Foco</label>
              <input
                type="number"
                min={1}
                max={120}
                value={settings.focus}
                onChange={(e) => updateSettings({ focus: Number(e.target.value) })}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Pausa Curta</label>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.shortBreak}
                onChange={(e) => updateSettings({ shortBreak: Number(e.target.value) })}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Pausa Longa</label>
              <input
                type="number"
                min={1}
                max={90}
                value={settings.longBreak}
                onChange={(e) => updateSettings({ longBreak: Number(e.target.value) })}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Volume & Goal Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Volume dos Alertas</span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
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
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Meta Diária</span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-400">
                {dailyGoal} Pomodoros
              </span>
            </div>

            <input
              type="number"
              min={1}
              max={30}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Push Notification Preferences Card */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Bell className="w-4 h-4 text-purple-400" />
              <span>Notificações &amp; Lembretes</span>
            </div>

            {hasPermission ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Permissão Concedida</span>
              </span>
            ) : (
              <button
                onClick={requestPermission}
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
              >
                Ativar Notificações
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pomodoroAlerts}
                onChange={(e) => updatePreferences({ pomodoroAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="text-xs text-zinc-200 font-semibold">Notificações do Pomodoro (Fim de foco e pausas)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.plannerAlerts}
                onChange={(e) => updatePreferences({ plannerAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="text-xs text-zinc-200 font-semibold">Notificações de Planejamento e compromissos</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.reminderAlerts}
                onChange={(e) => updatePreferences({ reminderAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="text-xs text-zinc-200 font-semibold">Lembretes de atividades próximas (10 minutos antes)</span>
            </label>
          </div>
        </div>

        {/* PWA Installation Section */}
        <InstallPWASection />
      </div>
    </MainLayout>
  );
}
