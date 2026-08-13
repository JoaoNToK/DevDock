'use client';

import React, { useState, useEffect } from 'react';
import { TimerSettings } from '@/hooks/usePomodoroTimer';
import { Settings, Check, Clock, X, Volume2, VolumeX, Bell, BellOff, Target } from 'lucide-react';

interface TimerSettingsComponentProps {
  isOpen: boolean;
  settings: TimerSettings;
  volume: number;
  dailyGoal: number;
  hasNotificationPermission: boolean;
  onClose: () => void;
  onSaveSettings: (newSettings: TimerSettings) => void;
  onVolumeChange: (newVolume: number) => void;
  onDailyGoalChange: (newGoal: number) => void;
  onRequestNotification: () => Promise<boolean>;
}

export const TimerSettingsComponent: React.FC<TimerSettingsComponentProps> = ({
  isOpen,
  settings,
  volume,
  dailyGoal,
  hasNotificationPermission,
  onClose,
  onSaveSettings,
  onVolumeChange,
  onDailyGoalChange,
  onRequestNotification,
}) => {
  const [focusInput, setFocusInput] = useState(settings.focus);
  const [shortBreakInput, setShortBreakInput] = useState(settings.shortBreak);
  const [longBreakInput, setLongBreakInput] = useState(settings.longBreak);
  const [dailyGoalInput, setDailyGoalInput] = useState(dailyGoal);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    setFocusInput(settings.focus);
    setShortBreakInput(settings.shortBreak);
    setLongBreakInput(settings.longBreak);
    setDailyGoalInput(dailyGoal);
  }, [settings, dailyGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validFocus = Math.min(180, Math.max(1, Number(focusInput) || 25));
    const validShort = Math.min(180, Math.max(1, Number(shortBreakInput) || 5));
    const validLong = Math.min(180, Math.max(1, Number(longBreakInput) || 15));
    const validGoal = Math.min(50, Math.max(1, Number(dailyGoalInput) || 8));

    onSaveSettings({
      focus: validFocus,
      shortBreak: validShort,
      longBreak: validLong,
    });

    onDailyGoalChange(validGoal);

    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Configurações</h3>
            <p className="text-xs text-zinc-400">Ajuste os tempos, áudio e metas</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time Customization Inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="focus-setting" className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-500" />
                <span>Foco</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="focus-setting"
                  type="number"
                  min="1"
                  max="180"
                  value={focusInput}
                  onChange={(e) => setFocusInput(Number(e.target.value))}
                  className="w-full py-2 pl-3 pr-8 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-2 text-[10px] text-zinc-500">m</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="short-setting" className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-500" />
                <span>Curta</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="short-setting"
                  type="number"
                  min="1"
                  max="180"
                  value={shortBreakInput}
                  onChange={(e) => setShortBreakInput(Number(e.target.value))}
                  className="w-full py-2 pl-3 pr-8 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-2 text-[10px] text-zinc-500">m</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="long-setting" className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-500" />
                <span>Longa</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="long-setting"
                  type="number"
                  min="1"
                  max="180"
                  value={longBreakInput}
                  onChange={(e) => setLongBreakInput(Number(e.target.value))}
                  className="w-full py-2 pl-3 pr-8 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <span className="absolute right-2 text-[10px] text-zinc-500">m</span>
              </div>
            </div>
          </div>

          {/* Daily Goal Input */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Target className="w-4 h-4 text-indigo-500" />
              <span>Meta Diária (Pomodoros)</span>
            </div>
            <div className="relative flex items-center w-28">
              <input
                id="goal-setting"
                type="number"
                min="1"
                max="50"
                value={dailyGoalInput}
                onChange={(e) => setDailyGoalInput(Number(e.target.value))}
                className="w-full py-1.5 pl-3 pr-8 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-2 text-[10px] text-zinc-500">/dia</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              {volume > 0 ? (
                <Volume2 className="w-4 h-4 text-indigo-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              )}
              <span>Volume dos alertas</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs font-mono font-semibold w-8 text-right text-zinc-300">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Browser Notification Permission */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              {hasNotificationPermission ? (
                <Bell className="w-4 h-4 text-emerald-500" />
              ) : (
                <BellOff className="w-4 h-4 text-zinc-500" />
              )}
              <span>Notificações no navegador</span>
            </div>
            <button
              type="button"
              onClick={onRequestNotification}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                hasNotificationPermission
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              }`}
            >
              {hasNotificationPermission ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ativadas</span>
                </>
              ) : (
                <span>Ativar</span>
              )}
            </button>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {showSavedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Salvo!</span>
                </>
              ) : (
                <span>Salvar configurações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
