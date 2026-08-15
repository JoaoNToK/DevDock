'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePomodoroTimer, TimerMode } from '@/hooks/usePomodoroTimer';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useStudies } from '@/hooks/useStudies';
import { useProjects } from '@/hooks/useProjects';
import { MainLayout } from '@/components/layout/MainLayout';
import { TimerModeSelector } from '@/components/TimerModeSelector';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { TimerControls } from '@/components/TimerControls';
import { SessionCounter } from '@/components/SessionCounter';
import { NotificationBanner } from '@/components/NotificationBanner';
import { ResetConfirmModal } from '@/components/ResetConfirmModal';
import { TaskManager } from '@/components/TaskManager';
import { ZenModeView } from '@/components/ZenModeView';
import { BookOpen, FolderKanban } from 'lucide-react';

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
  const { subjects, topics, recordStudyTime } = useStudies();
  const { projects, tasks: projectTasks, recordTaskFocusTime } = useProjects();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProjectTaskId, setSelectedProjectTaskId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pId = params.get('projectId');
      const tId = params.get('taskId');
      if (pId) setSelectedProjectId(pId);
      if (tId) setSelectedProjectTaskId(tId);
    }
  }, []);

  const [dismissedNotification, setDismissedNotification] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [tasks, activeTaskId]);

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => !selectedSubjectId || t.subjectId === selectedSubjectId);
  }, [topics, selectedSubjectId]);

  const filteredProjectTasks = useMemo(() => {
    return projectTasks.filter((t) => !selectedProjectId || t.projectId === selectedProjectId);
  }, [projectTasks, selectedProjectId]);

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
      if (selectedSubjectId) {
        recordStudyTime(selectedSubjectId, selectedTopicId, 25);
      }
      if (selectedProjectId) {
        recordTaskFocusTime(selectedProjectId, selectedProjectTaskId, 25);
      }
      reset();
    }
  };

  const handleConfirmReset = () => {
    setIsResetModalOpen(false);
    if (selectedSubjectId) {
      recordStudyTime(selectedSubjectId, selectedTopicId, 25);
    }
    if (selectedProjectId) {
      recordTaskFocusTime(selectedProjectId, selectedProjectTaskId, 25);
    }
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
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="flex items-center justify-between p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-extrabold text-white">Pomodoro &amp; Cronômetro</h2>
              <p className="text-xs text-zinc-400 font-medium">Foco contínuo e registro de tempo em Projetos e Estudos</p>
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

              {/* Linking Bar: Projects or Studies */}
              <div className="w-full max-w-sm my-3 space-y-2">
                {/* Project Selector */}
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>Em qual Projeto você está focando?</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value);
                        setSelectedProjectTaskId('');
                      }}
                      className="w-full py-1.5 px-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                    >
                      <option value="">(Selecione Projeto)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedProjectTaskId}
                      onChange={(e) => setSelectedProjectTaskId(e.target.value)}
                      className="w-full py-1.5 px-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                    >
                      <option value="">(Selecione Tarefa)</option>
                      {filteredProjectTasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Studies Selector */}
                <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ou qual Matéria / Estudo?</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => {
                        setSelectedSubjectId(e.target.value);
                        setSelectedTopicId('');
                      }}
                      className="w-full py-1.5 px-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                    >
                      <option value="">(Selecione Matéria)</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      className="w-full py-1.5 px-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                    >
                      <option value="">(Selecione Tópico)</option>
                      {filteredTopics.map((top) => (
                        <option key={top.id} value={top.id}>
                          {top.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

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
