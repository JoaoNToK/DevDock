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
import { TaskManager } from '@/components/TaskManager';
import { ZenModeView } from '@/components/ZenModeView';

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
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    setActiveTask,
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
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="flex items-center justify-between p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-extrabold text-white">Pomodoro &amp; Cronômetro</h2>
              <p className="text-xs text-zinc-400 font-medium">Foco contínuo e gerenciamento de tarefas</p>
            </div>

            <button
              onClick={() => setIsZenMode(true)}
              className="py-2 px-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-semibold text-xs border border-zinc-700/80 transition-all"
            >
              ✨ Modo Zen
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

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Timer Column */}
            <div className="lg:col-span-7 w-full p-6 sm:p-8 rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 shadow-xl flex flex-col items-center">
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

            {/* Task Manager Column */}
            <div className="lg:col-span-5 w-full">
              <TaskManager
                tasks={tasks}
                activeTaskId={activeTaskId}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onToggleComplete={toggleTaskComplete}
                onSetActiveTask={setActiveTask}
              />
            </div>
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
