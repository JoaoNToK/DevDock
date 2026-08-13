'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { playStartSound, playEndSound } from '@/utils/sound';
import { updateDynamicFavicon } from '@/utils/favicon';
import { sendBrowserNotification, requestNotificationPermission } from '@/utils/notifications';
import { getLocalDateString, getLocalTimeString } from '@/utils/analyticsUtils';
import { SessionRecord } from '@/types/analytics';
import { Task } from '@/types/task';
import confetti from 'canvas-confetti';

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

const STORAGE_KEYS = {
  SETTINGS: 'pomodoro_settings_v1',
  SESSIONS: 'pomodoro_sessions_v1',
  THEME: 'pomodoro_theme_v1',
  VOLUME: 'pomodoro_volume_v1',
  TOTAL_FOCUS: 'pomodoro_total_focus_v1',
  DAILY_GOAL: 'pomodoro_daily_goal_v1',
  SESSION_RECORDS: 'pomodoro_session_records_v1',
  TASKS: 'pomodoro_tasks_v1',
  ACTIVE_TASK: 'pomodoro_active_task_v1',
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

  // Time remaining or elapsed in seconds for UI rendering
  const [timeRemaining, setTimeRemaining] = useState<number>(DEFAULT_SETTINGS.focus * 60);

  // Timestamp references for countdown timer calculation
  const targetEndTimeRef = useRef<number | null>(null);
  const pausedMsRemainingRef = useRef<number | null>(null);
  const totalDurationMsRef = useRef<number>(DEFAULT_SETTINGS.focus * 60 * 1000);

  // Timestamp references for Stopwatch count-up mode
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

  // Initial Load from localStorage
  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
    }

    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.focus && parsed.shortBreak && parsed.longBreak) {
          setSettings(parsed);
          setTimeRemaining(parsed.focus * 60);
          totalDurationMsRef.current = parsed.focus * 60 * 1000;
        }
      }

      const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (savedSessions) {
        setCompletedSessions(Number(savedSessions) || 0);
      }

      const savedTotalFocus = localStorage.getItem(STORAGE_KEYS.TOTAL_FOCUS);
      if (savedTotalFocus) {
        setTotalFocusMinutes(Number(savedTotalFocus) || 0);
      }

      const savedDailyGoal = localStorage.getItem(STORAGE_KEYS.DAILY_GOAL);
      if (savedDailyGoal) {
        setDailyGoalState(Number(savedDailyGoal) || 8);
      }

      const savedRecords = localStorage.getItem(STORAGE_KEYS.SESSION_RECORDS);
      if (savedRecords) {
        setSessionRecords(JSON.parse(savedRecords) || []);
      }

      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks) || []);
      }

      const savedActiveTask = localStorage.getItem(STORAGE_KEYS.ACTIVE_TASK);
      if (savedActiveTask) {
        setActiveTaskIdState(savedActiveTask);
      }

      const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
      if (savedVolume !== null) {
        setVolumeState(Number(savedVolume));
      }

      if (typeof window !== 'undefined' && 'Notification' in window) {
        setHasNotificationPermission(Notification.permission === 'granted');
      }
    } catch (e) {
      console.error('Failed to parse localStorage:', e);
    }
  }, []);

  // Synchronize Dynamic Favicon
  useEffect(() => {
    if (!isMounted) return;
    updateDynamicFavicon(status, mode);
  }, [status, mode, isMounted]);

  // Handle Countdown Timer Finish Logic
  const handleFinish = useCallback(() => {
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
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Fallback
      }

      const now = new Date();
      const newRecord: SessionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        dateString: getLocalDateString(now),
        timeString: getLocalTimeString(now),
        durationMinutes: settings.focus,
        mode: 'focus',
      };

      setSessionRecords((prev) => {
        const updated = [...prev, newRecord];
        localStorage.setItem(STORAGE_KEYS.SESSION_RECORDS, JSON.stringify(updated));
        return updated;
      });

      setCompletedSessions((prev) => {
        const updated = prev + 1;
        localStorage.setItem(STORAGE_KEYS.SESSIONS, String(updated));
        return updated;
      });

      setTotalFocusMinutes((prev) => {
        const updated = prev + settings.focus;
        localStorage.setItem(STORAGE_KEYS.TOTAL_FOCUS, String(updated));
        return updated;
      });

      if (activeTaskId) {
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
          localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [mode, volume, settings.focus, activeTaskId]);

  // Tick function for both Countdown & Stopwatch modes
  const tick = useCallback(() => {
    if (mode === 'stopwatch') {
      if (status !== 'running' || !stopwatchStartTimeRef.current) return;
      const elapsedMs = stopwatchAccumulatedMsRef.current + (Date.now() - stopwatchStartTimeRef.current);
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      setTimeRemaining(elapsedSeconds);
    } else {
      if (!targetEndTimeRef.current) return;
      const now = Date.now();
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

  // Timer Control Functions
  const start = useCallback(() => {
    if (mode === 'stopwatch') {
      stopwatchAccumulatedMsRef.current = 0;
      stopwatchStartTimeRef.current = Date.now();
      setTimeRemaining(0);
      setStatus('running');
      playStartSound(volume);
      return;
    }

    const durationSecs = getModeDurationSeconds(mode, settings);
    const durationMs = durationSecs * 1000;
    totalDurationMsRef.current = durationMs;

    targetEndTimeRef.current = Date.now() + durationMs;
    pausedMsRemainingRef.current = null;
    setStatus('running');

    playStartSound(volume);
  }, [mode, settings, volume, getModeDurationSeconds]);

  const pause = useCallback(() => {
    if (status !== 'running') return;

    if (mode === 'stopwatch') {
      if (stopwatchStartTimeRef.current) {
        stopwatchAccumulatedMsRef.current += (Date.now() - stopwatchStartTimeRef.current);
        stopwatchStartTimeRef.current = null;
      }
      setStatus('paused');
      return;
    }

    if (!targetEndTimeRef.current) return;
    const remainingMs = Math.max(0, targetEndTimeRef.current - Date.now());
    pausedMsRemainingRef.current = remainingMs;
    targetEndTimeRef.current = null;
    setStatus('paused');
    setTimeRemaining(Math.ceil(remainingMs / 1000));
  }, [mode, status]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;

    if (mode === 'stopwatch') {
      stopwatchStartTimeRef.current = Date.now();
      setStatus('running');
      playStartSound(volume);
      return;
    }

    if (pausedMsRemainingRef.current === null) return;
    targetEndTimeRef.current = Date.now() + pausedMsRemainingRef.current;
    setStatus('running');
    playStartSound(volume);
  }, [mode, status, volume]);

  const reset = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (mode === 'stopwatch') {
      const elapsedMinutes = Math.floor(timeRemaining / 60);

      // Record stopwatch focus session if elapsed >= 1 minute
      if (elapsedMinutes >= 1) {
        const now = new Date();
        const newRecord: SessionRecord = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: Date.now(),
          dateString: getLocalDateString(now),
          timeString: getLocalTimeString(now),
          durationMinutes: elapsedMinutes,
          mode: 'stopwatch',
        };

        setSessionRecords((prev) => {
          const updated = [...prev, newRecord];
          localStorage.setItem(STORAGE_KEYS.SESSION_RECORDS, JSON.stringify(updated));
          return updated;
        });

        setTotalFocusMinutes((prev) => {
          const updated = prev + elapsedMinutes;
          localStorage.setItem(STORAGE_KEYS.TOTAL_FOCUS, String(updated));
          return updated;
        });

        if (activeTaskId && elapsedMinutes >= 15) {
          setTasks((prevTasks) => {
            const updated = prevTasks.map((t) => {
              if (t.id === activeTaskId) {
                const addedPomos = Math.floor(elapsedMinutes / 25) || 1;
                const updatedCompleted = t.completedPomodoros + addedPomos;
                return {
                  ...t,
                  completedPomodoros: updatedCompleted,
                  isCompleted: updatedCompleted >= t.estimatedPomodoros ? true : t.isCompleted,
                };
              }
              return t;
            });
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
            return updated;
          });
        }
      }

      stopwatchStartTimeRef.current = null;
      stopwatchAccumulatedMsRef.current = 0;
      setStatus('idle');
      setTimeRemaining(0);
      return;
    }

    targetEndTimeRef.current = null;
    pausedMsRemainingRef.current = null;
    setStatus('idle');

    const durationSecs = getModeDurationSeconds(mode, settings);
    totalDurationMsRef.current = durationSecs * 1000;
    setTimeRemaining(durationSecs);
  }, [mode, settings, timeRemaining, activeTaskId, getModeDurationSeconds]);

  const skipSession = useCallback(() => {
    if (mode === 'stopwatch') {
      reset();
      return;
    }

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    targetEndTimeRef.current = null;
    pausedMsRemainingRef.current = null;

    handleFinish();
  }, [mode, reset, handleFinish]);

  const switchMode = useCallback((newMode: TimerMode) => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    targetEndTimeRef.current = null;
    pausedMsRemainingRef.current = null;
    stopwatchStartTimeRef.current = null;
    stopwatchAccumulatedMsRef.current = 0;

    setMode(newMode);
    setStatus('idle');

    if (newMode === 'stopwatch') {
      setTimeRemaining(0);
      totalDurationMsRef.current = 0;
    } else {
      const durationSecs = getModeDurationSeconds(newMode, settings);
      totalDurationMsRef.current = durationSecs * 1000;
      setTimeRemaining(durationSecs);
    }
  }, [settings, getModeDurationSeconds]);

  const updateSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));

    if (status === 'idle') {
      if (mode === 'focus') setTimeRemaining(newSettings.focus * 60);
      else if (mode === 'shortBreak') setTimeRemaining(newSettings.shortBreak * 60);
      else if (mode === 'longBreak') setTimeRemaining(newSettings.longBreak * 60);
    }
  }, [mode, status]);

  const setVolume = useCallback((newVol: number) => {
    const safeVol = Math.max(0, Math.min(1, newVol));
    setVolumeState(safeVol);
    localStorage.setItem(STORAGE_KEYS.VOLUME, String(safeVol));
  }, []);

  const setDailyGoal = useCallback((newGoal: number) => {
    const safeGoal = Math.max(1, Math.min(50, newGoal));
    setDailyGoalState(safeGoal);
    localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, String(safeGoal));
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
    localStorage.setItem(STORAGE_KEYS.SESSIONS, '0');
    localStorage.setItem(STORAGE_KEYS.TOTAL_FOCUS, '0');
    localStorage.setItem(STORAGE_KEYS.SESSION_RECORDS, JSON.stringify([]));
  }, []);

  // Tasks Methods
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'dateString' | 'completedPomodoros' | 'isCompleted'>) => {
    const now = new Date();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: Date.now(),
      dateString: getLocalDateString(now),
    };

    setTasks((prev) => {
      const updated = [newTask, ...prev];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
      return updated;
    });

    if (activeTaskId === id) {
      setActiveTaskIdState(null);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TASK);
    }
  }, [activeTaskId]);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setActiveTask = useCallback((id: string | null) => {
    setActiveTaskIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TASK, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TASK);
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
