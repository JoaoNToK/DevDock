'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { playStartSound, playEndSound } from '@/utils/sound';
import { updateDynamicFavicon } from '@/utils/favicon';
import { sendBrowserNotification, requestNotificationPermission } from '@/utils/notifications';
import { getLocalDateString, getLocalTimeString } from '@/utils/analyticsUtils';
import { SessionRecord, SessionStatus } from '@/types/analytics';
import { Task } from '@/types/task';
import { savePomodoroSessionAction } from '@/app/actions/pomodoroActions';
import confetti from 'canvas-confetti';
import { STORAGE_KEYS, storageAdapter, useStorageSync } from '@/lib/storage';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak' | 'stopwatch';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface TimerSettings {
  focus: number;      // in minutes
  shortBreak: number; // in minutes
  longBreak: number;  // in minutes
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

export function usePomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(0);
  const [dailyGoal, setDailyGoalState] = useState<number>(8);
  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskIdState] = useState<string | null>(null);

  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(false);

  // Time remaining (or elapsed for stopwatch) in seconds for UI rendering
  const [timeRemaining, setTimeRemaining] = useState<number>(DEFAULT_SETTINGS.focus * 60);

  // --------------------------------------------------------------------------
  // REAL-TIME TIMESTAMP SOURCE OF TRUTH REFS
  // --------------------------------------------------------------------------
  const sessionStartedAtRef = useRef<number | null>(null);
  const lastActiveStartTimestampRef = useRef<number | null>(null);
  const accumulatedActiveMsRef = useRef<number>(0);
  const lastTickTimestampRef = useRef<number | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);
  const pausedMsRemainingRef = useRef<number | null>(null);

  // Idempotency protection ref against duplicate completion calls
  const isCompletingRef = useRef<boolean>(false);

  // Stopwatch refs
  const stopwatchStartTimeRef = useRef<number | null>(null);
  const stopwatchAccumulatedMsRef = useRef<number>(0);

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const getModeDurationSeconds = useCallback((targetMode: TimerMode, currentSettings: TimerSettings) => {
    switch (targetMode) {
      case 'focus':
        return currentSettings.focus * 60;
      case 'shortBreak':
        return currentSettings.shortBreak * 60;
      case 'longBreak':
        return currentSettings.longBreak * 60;
      case 'stopwatch':
        return 0;
    }
  }, []);

  // Compute exact active focus duration in seconds
  const getActualActiveDurationSeconds = useCallback(() => {
    let activeMs = accumulatedActiveMsRef.current;
    if (status === 'running' && lastActiveStartTimestampRef.current) {
      activeMs += Math.max(0, Date.now() - lastActiveStartTimestampRef.current);
    }
    return Math.floor(activeMs / 1000);
  }, [status]);

  // Initial Load from localStorage via StorageAdapter
  const loadState = useCallback(() => {
    const savedSettings = storageAdapter.get<TimerSettings>(
      STORAGE_KEYS.POMODORO_SETTINGS,
      storageAdapter.get<TimerSettings>(STORAGE_KEYS.LEGACY_POMODORO_SETTINGS, DEFAULT_SETTINGS)
    );
    if (savedSettings?.focus && savedSettings?.shortBreak && savedSettings?.longBreak) {
      setSettings(savedSettings);
    }

    setCompletedSessions(
      Number(storageAdapter.getRaw(STORAGE_KEYS.POMODORO_SESSIONS, storageAdapter.getRaw(STORAGE_KEYS.LEGACY_POMODORO_SESSIONS, '0'))) || 0
    );

    setTotalFocusMinutes(
      Number(storageAdapter.getRaw(STORAGE_KEYS.POMODORO_TOTAL_FOCUS, storageAdapter.getRaw(STORAGE_KEYS.LEGACY_POMODORO_TOTAL_FOCUS, '0'))) || 0
    );

    setDailyGoalState(
      Number(storageAdapter.getRaw(STORAGE_KEYS.POMODORO_DAILY_GOAL, storageAdapter.getRaw(STORAGE_KEYS.LEGACY_POMODORO_DAILY_GOAL, '8'))) || 8
    );

    setSessionRecords(
      storageAdapter.get<SessionRecord[]>(
        STORAGE_KEYS.POMODORO_RECORDS,
        storageAdapter.get<SessionRecord[]>(STORAGE_KEYS.LEGACY_POMODORO_RECORDS, [])
      )
    );

    setTasks(
      storageAdapter.get<Task[]>(
        STORAGE_KEYS.POMODORO_TASKS,
        storageAdapter.get<Task[]>(STORAGE_KEYS.LEGACY_POMODORO_TASKS, [])
      )
    );

    setActiveTaskIdState(
      storageAdapter.getRaw(
        STORAGE_KEYS.POMODORO_ACTIVE_TASK,
        storageAdapter.getRaw(STORAGE_KEYS.LEGACY_POMODORO_ACTIVE_TASK, '')
      )
    );

    setVolumeState(
      Number(storageAdapter.getRaw(STORAGE_KEYS.POMODORO_VOLUME, storageAdapter.getRaw(STORAGE_KEYS.LEGACY_POMODORO_VOLUME, '0.8'))) || 0.8
    );

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
    loadState();
  }, [loadState]);

  // Reactive cross-tab & same-window storage sync for Pomodoro session records, settings and tasks
  useStorageSync(
    [
      STORAGE_KEYS.POMODORO_RECORDS,
      STORAGE_KEYS.POMODORO_TASKS,
      STORAGE_KEYS.POMODORO_SESSIONS,
      STORAGE_KEYS.POMODORO_SETTINGS,
      STORAGE_KEYS.POMODORO_DAILY_GOAL,
      STORAGE_KEYS.POMODORO_VOLUME,
      STORAGE_KEYS.LEGACY_POMODORO_RECORDS,
      STORAGE_KEYS.LEGACY_POMODORO_TASKS,
    ],
    loadState
  );

  // Synchronize timeRemaining whenever settings change while timer is idle
  useEffect(() => {
    if (status === 'idle' && mode !== 'stopwatch') {
      const durationSecs = getModeDurationSeconds(mode, settings);
      setTimeRemaining(durationSecs);
    }
  }, [settings, mode, status, getModeDurationSeconds]);

  // Synchronize Dynamic Favicon
  useEffect(() => {
    if (!isMounted) return;
    updateDynamicFavicon(status, mode);
  }, [status, mode, isMounted]);

  // Helper to record session history
  const recordSessionHistory = useCallback(
    async (
      sessionStatus: SessionStatus,
      configuredSecs: number,
      actualSecs: number
    ) => {
      const now = new Date();
      const startedAtTime = sessionStartedAtRef.current || (Date.now() - actualSecs * 1000);
      const endedAtTime = Date.now();

      const newRecord: SessionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: endedAtTime,
        dateString: getLocalDateString(now),
        timeString: getLocalTimeString(now),
        durationMinutes: Math.max(1, Math.round(actualSecs / 60)),
        configuredDurationSeconds: configuredSecs,
        actualDurationSeconds: actualSecs,
        status: sessionStatus,
        mode,
        startedAt: startedAtTime,
        endedAt: endedAtTime,
        taskId: activeTaskId || undefined,
      };

      setSessionRecords((prev) => {
        const updated = [...prev, newRecord];
        storageAdapter.set(STORAGE_KEYS.POMODORO_RECORDS, updated);
        return updated;
      });

      // Save to PostgreSQL backend asynchronously
      savePomodoroSessionAction({
        mode,
        configuredDuration: configuredSecs,
        actualDuration: actualSecs,
        status: sessionStatus,
        startedAt: new Date(startedAtTime).toISOString(),
        endedAt: new Date(endedAtTime).toISOString(),
        taskId: activeTaskId || undefined,
      });

      // Increment metrics ONLY for COMPLETED focus sessions or actual focus time
      if (mode === 'focus') {
        const actualMinutes = Math.floor(actualSecs / 60);

        if (sessionStatus === 'COMPLETED') {
          setCompletedSessions((prev) => {
            const updated = prev + 1;
            storageAdapter.set(STORAGE_KEYS.POMODORO_SESSIONS, updated);
            return updated;
          });
        }

        if (actualMinutes > 0) {
          setTotalFocusMinutes((prev) => {
            const updated = prev + actualMinutes;
            storageAdapter.set(STORAGE_KEYS.POMODORO_TOTAL_FOCUS, updated);
            return updated;
          });
        }

        if (activeTaskId && sessionStatus === 'COMPLETED') {
          setTasks((prevTasks) => {
            const updated = prevTasks.map((t) => {
              if (t.id === activeTaskId) {
                const updatedCompleted = t.completedPomodoros + 1;
                return {
                  ...t,
                  completedPomodoros: updatedCompleted,
                  isCompleted: updatedCompleted >= t.estimatedPomodoros ? true : t.isCompleted,
                };
              }
              return t;
            });
            storageAdapter.set(STORAGE_KEYS.POMODORO_TASKS, updated);
            return updated;
          });
        }
      }
    },
    [mode, activeTaskId]
  );

  // --------------------------------------------------------------------------
  // NATURAL COMPLETION (00:00)
  // --------------------------------------------------------------------------
  const handleFinish = useCallback(() => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    setStatus('finished');
    targetEndTimeRef.current = null;
    pausedMsRemainingRef.current = null;
    setTimeRemaining(0);

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    playEndSound(volume);

    const modeLabel = mode === 'focus' ? 'Foco' : mode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa';
    sendBrowserNotification(
      `🎉 ${modeLabel} concluído!`,
      mode === 'focus'
        ? 'Parabéns pelo foco! Hora de fazer uma pausa.'
        : 'Sua pausa terminou! Pronto para voltar ao trabalho?'
    );

    if (mode === 'focus') {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // Fallback
      }
    }

    const configuredSecs = getModeDurationSeconds(mode, settings);
    const actualSecs = getActualActiveDurationSeconds();

    recordSessionHistory('COMPLETED', configuredSecs, actualSecs > 0 ? actualSecs : configuredSecs);
  }, [mode, volume, settings, getModeDurationSeconds, getActualActiveDurationSeconds, recordSessionHistory]);

  // --------------------------------------------------------------------------
  // TICK FUNCTION (REAL-TIME TIMESTAMP BASED + OS SLEEP DETECTION)
  // --------------------------------------------------------------------------
  const tick = useCallback(() => {
    const now = Date.now();

    // OS Sleep / Thread Freeze Detection
    if (lastTickTimestampRef.current) {
      const deltaSinceLastTick = now - lastTickTimestampRef.current;
      // If tick gap > 10s, system went to sleep or thread froze
      if (deltaSinceLastTick > 10000 && status === 'running') {
        const freezeGapMs = deltaSinceLastTick - 250;
        if (targetEndTimeRef.current) {
          targetEndTimeRef.current += freezeGapMs;
        }
      }
    }
    lastTickTimestampRef.current = now;

    if (mode === 'stopwatch') {
      if (status !== 'running' || !stopwatchStartTimeRef.current) return;
      const elapsedMs = stopwatchAccumulatedMsRef.current + (now - stopwatchStartTimeRef.current);
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      setTimeRemaining(elapsedSeconds);
    } else {
      if (!targetEndTimeRef.current) return;
      const remainingMs = targetEndTimeRef.current - now;

      if (remainingMs <= 0) {
        handleFinish();
      } else {
        const secondsLeft = Math.ceil(remainingMs / 1000);
        setTimeRemaining(secondsLeft);
      }
    }
  }, [mode, status, handleFinish]);

  useEffect(() => {
    if (status === 'running') {
      lastTickTimestampRef.current = Date.now();
      tick();
      intervalIdRef.current = setInterval(tick, 250);
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [status, tick]);

  // Handle visibility change (Return to Tab / Background Execution)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'running') {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, tick]);

  // Document Title update
  useEffect(() => {
    if (!isMounted) return;

    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    let modeLabel = 'Foco';
    if (mode === 'shortBreak') modeLabel = 'Pausa Curta';
    else if (mode === 'longBreak') modeLabel = 'Pausa Longa';
    else if (mode === 'stopwatch') modeLabel = 'Cronômetro';

    if (status === 'running') {
      document.title = `(${formattedMins}:${formattedSecs}) ${modeLabel} - DevDock`;
    } else if (status === 'paused') {
      document.title = `[Pausado] ${formattedMins}:${formattedSecs} - DevDock`;
    } else if (status === 'finished') {
      document.title = `🎉 Fim do tempo! - DevDock`;
    } else {
      document.title = `DevDock — Foco & Produtividade`;
    }
  }, [timeRemaining, mode, status, isMounted]);

  // --------------------------------------------------------------------------
  // TIMER CONTROLS
  // --------------------------------------------------------------------------
  const start = useCallback(() => {
    const now = Date.now();
    sessionStartedAtRef.current = now;
    lastActiveStartTimestampRef.current = now;
    accumulatedActiveMsRef.current = 0;
    lastTickTimestampRef.current = now;
    isCompletingRef.current = false;

    if (mode === 'stopwatch') {
      stopwatchAccumulatedMsRef.current = 0;
      stopwatchStartTimeRef.current = now;
      setTimeRemaining(0);
      setStatus('running');
      playStartSound(volume);
      return;
    }

    const durationSecs = getModeDurationSeconds(mode, settings);
    const durationMs = durationSecs * 1000;

    targetEndTimeRef.current = now + durationMs;
    pausedMsRemainingRef.current = null;
    setStatus('running');

    playStartSound(volume);
  }, [mode, settings, volume, getModeDurationSeconds]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    const now = Date.now();

    if (mode === 'stopwatch') {
      if (stopwatchStartTimeRef.current) {
        stopwatchAccumulatedMsRef.current += (now - stopwatchStartTimeRef.current);
        stopwatchStartTimeRef.current = null;
      }
      setStatus('paused');
      return;
    }

    if (lastActiveStartTimestampRef.current) {
      accumulatedActiveMsRef.current += Math.max(0, now - lastActiveStartTimestampRef.current);
      lastActiveStartTimestampRef.current = null;
    }

    if (targetEndTimeRef.current) {
      const remainingMs = Math.max(0, targetEndTimeRef.current - now);
      pausedMsRemainingRef.current = remainingMs;
      targetEndTimeRef.current = null;
      setTimeRemaining(Math.ceil(remainingMs / 1000));
    }

    setStatus('paused');
  }, [mode, status]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    const now = Date.now();
    lastActiveStartTimestampRef.current = now;
    lastTickTimestampRef.current = now;

    if (mode === 'stopwatch') {
      stopwatchStartTimeRef.current = now;
      setStatus('running');
      playStartSound(volume);
      return;
    }

    if (pausedMsRemainingRef.current !== null) {
      targetEndTimeRef.current = now + pausedMsRemainingRef.current;
      pausedMsRemainingRef.current = null;
    }

    setStatus('running');
    playStartSound(volume);
  }, [mode, status, volume]);

  const reset = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    const actualSecs = getActualActiveDurationSeconds();
    const configuredSecs = getModeDurationSeconds(mode, settings);

    // Record partial session as RESET if active focus was >= 10 seconds
    if (actualSecs >= 10 && (status === 'running' || status === 'paused')) {
      recordSessionHistory('RESET', configuredSecs, actualSecs);
    }

    sessionStartedAtRef.current = null;
    lastActiveStartTimestampRef.current = null;
    accumulatedActiveMsRef.current = 0;
    targetEndTimeRef.current = null;
    pausedMsRemainingRef.current = null;
    stopwatchStartTimeRef.current = null;
    stopwatchAccumulatedMsRef.current = 0;
    isCompletingRef.current = false;

    setStatus('idle');

    if (mode === 'stopwatch') {
      setTimeRemaining(0);
    } else {
      setTimeRemaining(configuredSecs);
    }
  }, [mode, settings, status, getModeDurationSeconds, getActualActiveDurationSeconds, recordSessionHistory]);

  const skipSession = useCallback(() => {
    if (mode === 'stopwatch') {
      reset();
      return;
    }

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    const actualSecs = getActualActiveDurationSeconds();
    const configuredSecs = getModeDurationSeconds(mode, settings);

    // Record session as SKIPPED if active focus was >= 10 seconds
    if (actualSecs >= 10) {
      recordSessionHistory('SKIPPED', configuredSecs, actualSecs);
    }

    sessionStartedAtRef.current = null;
    lastActiveStartTimestampRef.current = null;
    accumulatedActiveMsRef.current = 0;
    targetEndTimeRef.current = null;
    pausedMsRemainingRef.current = null;
    isCompletingRef.current = false;

    // Advance to next mode cleanly without recording fake completed 25m!
    if (mode === 'focus') {
      setMode('shortBreak');
      const nextDuration = settings.shortBreak * 60;
      setTimeRemaining(nextDuration);
    } else {
      setMode('focus');
      const nextDuration = settings.focus * 60;
      setTimeRemaining(nextDuration);
    }

    setStatus('idle');
  }, [mode, settings, getModeDurationSeconds, getActualActiveDurationSeconds, recordSessionHistory, reset]);

  const switchMode = useCallback((newMode: TimerMode) => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    sessionStartedAtRef.current = null;
    lastActiveStartTimestampRef.current = null;
    accumulatedActiveMsRef.current = 0;
    targetEndTimeRef.current = null;
    pausedMsRemainingRef.current = null;
    stopwatchStartTimeRef.current = null;
    stopwatchAccumulatedMsRef.current = 0;
    isCompletingRef.current = false;

    setMode(newMode);
    setStatus('idle');

    if (newMode === 'stopwatch') {
      setTimeRemaining(0);
    } else {
      const durationSecs = getModeDurationSeconds(newMode, settings);
      setTimeRemaining(durationSecs);
    }
  }, [settings, getModeDurationSeconds]);

  const updateSettings = useCallback(
    (newSettings: Partial<TimerSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        storageAdapter.set(STORAGE_KEYS.POMODORO_SETTINGS, updated);

        if (status === 'idle') {
          if (mode === 'focus') setTimeRemaining(updated.focus * 60);
          else if (mode === 'shortBreak') setTimeRemaining(updated.shortBreak * 60);
          else if (mode === 'longBreak') setTimeRemaining(updated.longBreak * 60);
        }
        return updated;
      });
    },
    [status, mode]
  );

  const setVolume = useCallback((newVol: number) => {
    const safeVol = Math.max(0, Math.min(1, newVol));
    setVolumeState(safeVol);
    storageAdapter.set(STORAGE_KEYS.POMODORO_VOLUME, safeVol);
  }, []);

  const setDailyGoal = useCallback((newGoal: number) => {
    const safeGoal = Math.max(1, Math.min(50, newGoal));
    setDailyGoalState(safeGoal);
    storageAdapter.set(STORAGE_KEYS.POMODORO_DAILY_GOAL, safeGoal);
  }, []);

  const requestNotification = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setHasNotificationPermission(granted);
    return granted;
  }, []);

  const clearSessions = useCallback(() => {
    setCompletedSessions(0);
    setTotalFocusMinutes(0);
    setSessionRecords([]);
    storageAdapter.set(STORAGE_KEYS.POMODORO_SESSIONS, 0);
    storageAdapter.set(STORAGE_KEYS.POMODORO_TOTAL_FOCUS, 0);
    storageAdapter.set(STORAGE_KEYS.POMODORO_RECORDS, []);
  }, []);

  // Tasks Methods
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'isCompleted' | 'dateString'> & { dateString?: string }) => {
    const now = new Date();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: Date.now(),
      dateString: taskData.dateString || getLocalDateString(now),
    };

    setTasks((prev) => {
      const updated = [newTask, ...prev];
      storageAdapter.set(STORAGE_KEYS.POMODORO_TASKS, updated);
      return updated;
    });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      storageAdapter.set(STORAGE_KEYS.POMODORO_TASKS, updated);
      return updated;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      storageAdapter.set(STORAGE_KEYS.POMODORO_TASKS, updated);
      return updated;
    });

    if (activeTaskId === id) {
      setActiveTaskIdState(null);
      storageAdapter.remove(STORAGE_KEYS.POMODORO_ACTIVE_TASK);
    }
  }, [activeTaskId]);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
      storageAdapter.set(STORAGE_KEYS.POMODORO_TASKS, updated);
      return updated;
    });
  }, []);

  const setActiveTask = useCallback((id: string | null) => {
    setActiveTaskIdState(id);
    if (id) {
      storageAdapter.set(STORAGE_KEYS.POMODORO_ACTIVE_TASK, id);
    } else {
      storageAdapter.remove(STORAGE_KEYS.POMODORO_ACTIVE_TASK);
    }
  }, []);

  const totalDurationSeconds = mode === 'stopwatch' ? 0 : getModeDurationSeconds(mode, settings);

  return {
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
  };
}
