'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { usePomodoroTimer, TimerMode } from '@/hooks/usePomodoroTimer';
import { useFullscreen } from '@/hooks/useFullscreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { TimerModeSelector } from '@/components/TimerModeSelector';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { TimerControls } from '@/components/TimerControls';
import { SessionCounter } from '@/components/SessionCounter';
import { TimerSettingsComponent } from '@/components/TimerSettings';
import { NotificationBanner } from '@/components/NotificationBanner';
import { ResetConfirmModal } from '@/components/ResetConfirmModal';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { TaskManager } from '@/components/TaskManager';
import { ZenModeView } from '@/components/ZenModeView';
import { AuthModal } from '@/components/AuthModal';
import { UserProfileModal } from '@/components/UserProfileModal';

function PomodoroApp() {
  const {
    mode,
    status,
    settings,
    timeRemaining,
    totalDurationSeconds,
    completedSessions,
    totalFocusMinutes,
    dailyGoal,
    sessionRecords,
    tasks,
    activeTaskId,
    volume,
    isMounted,
    hasNotificationPermission,
    start,
    pause,
    resume,
    reset,
    skipSession,
    switchMode,
    updateSettings,
    setVolume,
    setDailyGoal,
    requestNotification,
    clearSessions,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    setActiveTask,
  } = usePomodoroTimer();

  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { user, syncUserData } = useAuth();

  const [dismissedNotification, setDismissedNotification] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [tasks, activeTaskId]);

  // Automatic Cloud Sync when user is logged in
  useEffect(() => {
    if (user && isMounted) {
      syncUserData({
        settings,
        sessionRecords,
        tasks,
        totalFocusMinutes,
        completedSessions,
        dailyGoal,
        volume,
      });
    }
  }, [
    user,
    isMounted,
    settings,
    sessionRecords,
    tasks,
    totalFocusMinutes,
    completedSessions,
    dailyGoal,
    volume,
    syncUserData,
  ]);

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

  const handleRestoreCloudData = (restoredData: any) => {
    if (restoredData.settings) updateSettings(restoredData.settings);
    if (restoredData.volume !== undefined) setVolume(restoredData.volume);
    if (restoredData.dailyGoal !== undefined) setDailyGoal(restoredData.dailyGoal);
  };

  const currentExportData = useMemo(() => {
    return {
      settings,
      sessionRecords,
      tasks,
      totalFocusMinutes,
      completedSessions,
      dailyGoal,
      volume,
      lastSyncedAt: Date.now(),
    };
  }, [settings, sessionRecords, tasks, totalFocusMinutes, completedSessions, dailyGoal, volume]);

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <>
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
        <main className="min-h-screen bg-black bg-radial-gradient flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-5xl flex flex-col items-center">
            {/* Header with User Account, Zen Mode, Estatísticas and Configurações buttons */}
            <Header
              onEnterZenMode={() => setIsZenMode(true)}
              onOpenAnalytics={() => setIsAnalyticsOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Completion Notification Banner */}
            {status === 'finished' && !dismissedNotification && (
              <NotificationBanner
                mode={mode}
                onDismiss={handleDismissNotification}
                onSelectNextMode={handleSelectNextModeFromNotification}
              />
            )}

            {/* 2-Column Grid Layout: Timer on Left, Task Manager on Right */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Pomodoro Timer & Controls */}
              <div className="lg:col-span-7 w-full p-6 sm:p-8 rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 shadow-xl flex flex-col items-center transition-all duration-300">
                {/* Mode Selector */}
                <TimerModeSelector currentMode={mode} onSelectMode={handleSwitchMode} />

                {/* Main Timer Display */}
                <PomodoroTimer
                  timeRemaining={timeRemaining}
                  totalDurationSeconds={totalDurationSeconds}
                  mode={mode}
                  status={status}
                  activeTaskTitle={activeTask?.title}
                />

                {/* Control Buttons */}
                <TimerControls
                  status={status}
                  mode={mode}
                  onStart={handleStart}
                  onPause={pause}
                  onResume={resume}
                  onRequestReset={handleRequestReset}
                  onSkip={skipSession}
                />

                {/* Completed Sessions & Total Focus Time Counter */}
                <SessionCounter
                  completedSessions={completedSessions}
                  totalFocusMinutes={totalFocusMinutes}
                  onClearSessions={clearSessions}
                />
              </div>

              {/* Right Column: Task Manager */}
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
          </div>

          {/* Subtle Footer */}
          <footer className="mt-8 text-center text-xs text-zinc-500 font-medium">
            <p>DevDock — Simples, Moderno &amp; Produtivo</p>
          </footer>
        </main>
      )}

      {/* Confirmation Modal before Reset */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />

      {/* Settings Modal */}
      <TimerSettingsComponent
        isOpen={isSettingsOpen}
        settings={settings}
        volume={volume}
        dailyGoal={dailyGoal}
        hasNotificationPermission={hasNotificationPermission}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={updateSettings}
        onVolumeChange={setVolume}
        onDailyGoalChange={setDailyGoal}
        onRequestNotification={requestNotification}
      />

      {/* Analytics & Productivity Dashboard Modal */}
      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        records={sessionRecords}
        totalFocusMinutes={totalFocusMinutes}
        dailyGoal={dailyGoal}
        onClose={() => setIsAnalyticsOpen(false)}
        onClearHistory={clearSessions}
      />

      {/* Authentication Modal (Login / Signup / Google OAuth) */}
      <AuthModal />

      {/* User Profile Modal (Cloud Sync & Backup) */}
      <UserProfileModal
        onRestoreCloudData={handleRestoreCloudData}
        currentExportData={currentExportData}
      />
    </>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <PomodoroApp />
    </AuthProvider>
  );
}
