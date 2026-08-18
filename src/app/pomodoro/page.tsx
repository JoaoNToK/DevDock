'use client';

import React, { useState, useMemo } from 'react';
import { usePomodoroTimer, TimerMode } from '@/hooks/usePomodoroTimer';
import { useFullscreen } from '@/hooks/useFullscreen';
import { MainLayout } from '@/components/layout/MainLayout';
import { TimerModeSelector } from '@/components/TimerModeSelector';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { TimerControls } from '@/components/TimerControls';
import { SessionCounter } from '@/components/SessionCounter';
import { NotificationBanner } from '@/components/NotificationBanner';
import { ResetConfirmModal } from '@/components/ResetConfirmModal';
import { ZenModeView } from '@/components/ZenModeView';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function PomodoroPage() {
  const {
    mode,
    status,
    timeRemaining,
    totalDurationSeconds,
    completedSessions,
    totalFocusMinutes,
    tasks,
    activeTaskId,
    isMounted,
    start,
    pause,
    resume,
    reset,
    skipSession,
    switchMode,
    clearSessions,
  } = usePomodoroTimer();

  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [dismissedNotification, setDismissedNotification] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [tasks, activeTaskId]);

  const handleDismissNotification = () => {
    setDismissedNotification(true);
  };

  const handleSelectNextModeFromNotification = (nextMode: TimerMode) => {
    setDismissedNotification(true);
    switchMode(nextMode);
  };

  const handleStart = () => {
    setDismissedNotification(false);
    start();
  };

  const handleSwitchMode = (newMode: TimerMode) => {
    setDismissedNotification(false);
    switchMode(newMode);
  };

  const handleRequestReset = () => {
    if (status === 'running' || status === 'paused') {
      setIsResetModalOpen(true);
    } else {
      reset();
    }
  };

  const handleConfirmReset = () => {
    setIsResetModalOpen(false);
    reset();
  };

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--border-color)] border-t-[var(--text-primary)] animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideSidebar={isZenMode}>
      {isZenMode ? (
        <ZenModeView
          mode={mode}
          status={status}
          timeRemaining={timeRemaining}
          totalDurationSeconds={totalDurationSeconds}
          activeTaskTitle={activeTask?.title}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onStart={handleStart}
          onPause={pause}
          onResume={resume}
          onRequestReset={handleRequestReset}
          onSkip={skipSession}
          onSelectMode={handleSwitchMode}
          onExitZenMode={() => setIsZenMode(false)}
        />
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Top Header Banner */}
          <div className="flex items-center justify-between p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-extrabold text-primary-theme">Pomodoro &amp; Cronômetro</h2>
              <p className="text-xs text-secondary-theme font-medium">Foque no que importa com controle simples e intuitivo</p>
            </div>

            <button
              onClick={() => setIsZenMode(true)}
              className="py-2 px-3.5 rounded-2xl theme-card-elevated hover:bg-zinc-800 text-primary-theme font-semibold text-xs border border-[var(--border-color)] transition-all"
            >
              <span className="inline-flex items-center gap-1 font-semibold text-xs">
                <MaterialIcon name="auto_awesome" size={14} />
                <span>Modo Zen</span>
              </span>
            </button>
          </div>

          {/* Completion Notification Banner */}
          {status === 'finished' && !dismissedNotification && (
            <NotificationBanner
              mode={mode}
              onDismiss={handleDismissNotification}
              onSelectNextMode={handleSelectNextModeFromNotification}
            />
          )}

          {/* Centered Timer Container */}
          <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl theme-surface backdrop-blur-xl border border-[var(--border-color)] shadow-xl flex flex-col items-center justify-center space-y-6">
            <TimerModeSelector currentMode={mode} onSelectMode={handleSwitchMode} />

            <PomodoroTimer
              timeRemaining={timeRemaining}
              totalDurationSeconds={totalDurationSeconds}
              mode={mode}
              status={status}
              activeTaskTitle={activeTask?.title}
            />

            <TimerControls
              status={status}
              mode={mode}
              onStart={handleStart}
              onPause={pause}
              onResume={resume}
              onRequestReset={handleRequestReset}
              onSkip={skipSession}
            />

            <SessionCounter
              completedSessions={completedSessions}
              totalFocusMinutes={totalFocusMinutes}
              onClearSessions={clearSessions}
            />
          </div>

          <ResetConfirmModal
            isOpen={isResetModalOpen}
            onConfirm={handleConfirmReset}
            onCancel={() => setIsResetModalOpen(false)}
          />
        </div>
      )}
    </MainLayout>
  );
}
