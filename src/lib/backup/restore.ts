import { DevDockBackupFile, DevDockBackupMetadata, RestoreMode } from './types';
import { generateBackupData } from './export';

const SAFETY_BACKUP_KEY = 'devdock_safety_auto_backup_temp';

export interface RestoreResult {
  success: boolean;
  message: string;
  counts: DevDockBackupMetadata['counts'] | null;
}

/**
 * Restores DevDock backup data safely.
 * Auto-creates a temporary safety backup before replacement so rollback is possible if errors occur.
 */
export function restoreBackupData(
  backupFile: DevDockBackupFile,
  mode: RestoreMode = 'replace'
): RestoreResult {
  if (typeof window === 'undefined') {
    throw new Error('Backup restore must run in browser environment.');
  }

  // 1. Create Safety Backup of current state before any operation
  try {
    const currentData = generateBackupData();
    localStorage.setItem(SAFETY_BACKUP_KEY, JSON.stringify(currentData));
  } catch (e) {
    console.warn('Could not store temporary safety backup:', e);
  }

  try {
    const d = backupFile.data;

    if (mode === 'replace') {
      // CLEAR & REPLACE MODE

      // 1. Settings & Preferences
      if (d.settings?.theme) {
        localStorage.setItem('devdock_theme_preference_v1', d.settings.theme);
        document.documentElement.classList.remove('dark', 'light');
        if (d.settings.theme === 'dark' || (d.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else if (d.settings.theme === 'light') {
          document.documentElement.classList.add('light');
        }
      }

      if (d.settings?.notifications) {
        localStorage.setItem('devdock_notification_preferences_v1', JSON.stringify(d.settings.notifications));
      }

      if (d.settings?.pomodoro) {
        localStorage.setItem('pomodoro_settings_v1', JSON.stringify({
          focus: d.settings.pomodoro.focus || 25,
          shortBreak: d.settings.pomodoro.shortBreak || 5,
          longBreak: d.settings.pomodoro.longBreak || 15,
        }));
      }

      // 2. Pomodoro Data
      if (d.pomodoro) {
        localStorage.setItem('pomodoro_sessions_v1', String(d.pomodoro.completedSessions || 0));
        localStorage.setItem('pomodoro_total_focus_minutes_v1', String(d.pomodoro.totalFocusMinutes || 0));
        localStorage.setItem('pomodoro_daily_goal_v1', String(d.pomodoro.dailyGoal || 8));
        localStorage.setItem('pomodoro_volume_v1', String(d.pomodoro.volume || 0.8));
        localStorage.setItem('pomodoro_session_records_v1', JSON.stringify(d.pomodoro.sessionRecords || []));
        localStorage.setItem('pomodoro_tasks_v1', JSON.stringify(d.pomodoro.tasks || []));
      }

      // 3. Calendar & Planner
      localStorage.setItem('devdock_calendar_events_v1', JSON.stringify(d.calendarEvents || []));
      localStorage.setItem('devdock_planner_activities_v1', JSON.stringify(d.plannerActivities || []));

      // 4. Studies & Academic
      localStorage.setItem('devdock_studies_data_v2', JSON.stringify(d.studiesData || {
        subjects: [],
        topics: [],
        notes: [],
        goals: [],
        resources: [],
      }));

      localStorage.setItem('devdock_academic_data_v1', JSON.stringify(d.academicData || {
        course: null,
        semesters: [],
        subjects: [],
        assignments: [],
      }));

      // 5. Projects & Kanban
      localStorage.setItem('devdock_projects_data_v1', JSON.stringify(d.projectsData || {
        projects: [],
        columns: [],
        tasks: [],
        notes: [],
        docs: [],
        goals: [],
        resources: [],
        timeline: [],
      }));
    } else {
      // MERGE MODE (Combines new items without duplicating IDs)
      const parseJSON = <T>(key: string, fallback: T): T => {
        try {
          const raw = localStorage.getItem(key);
          return raw ? (JSON.parse(raw) as T) : fallback;
        } catch (e) {
          return fallback;
        }
      };

      const mergeArrays = <T extends { id?: string }>(existingArr: T[], newArr: T[]): T[] => {
        const map = new Map<string, T>();
        (existingArr || []).forEach((item) => map.set(item.id || JSON.stringify(item), item));
        (newArr || []).forEach((item) => map.set(item.id || JSON.stringify(item), item));
        return Array.from(map.values());
      };

      // Merge Calendar
      const existingEvents = parseJSON('devdock_calendar_events_v1', []);
      const mergedEvents = mergeArrays(existingEvents, d.calendarEvents || []);
      localStorage.setItem('devdock_calendar_events_v1', JSON.stringify(mergedEvents));

      // Merge Planner
      const existingPlanner = parseJSON('devdock_planner_activities_v1', []);
      const mergedPlanner = mergeArrays(existingPlanner, d.plannerActivities || []);
      localStorage.setItem('devdock_planner_activities_v1', JSON.stringify(mergedPlanner));

      // Merge Pomodoro Records & Tasks
      if (d.pomodoro) {
        const existingRecords = parseJSON('pomodoro_session_records_v1', []);
        const mergedRecords = mergeArrays(existingRecords, d.pomodoro.sessionRecords || []);
        localStorage.setItem('pomodoro_session_records_v1', JSON.stringify(mergedRecords));

        const existingTasks = parseJSON('pomodoro_tasks_v1', []);
        const mergedTasks = mergeArrays(existingTasks, d.pomodoro.tasks || []);
        localStorage.setItem('pomodoro_tasks_v1', JSON.stringify(mergedTasks));
      }
    }

    // Dispatch global event for open React contexts/hooks to update reactively
    window.dispatchEvent(new Event('devdock-backup-restored'));
    window.dispatchEvent(new Event('storage'));

    return {
      success: true,
      message: 'Backup restaurado com sucesso! Todos os módulos foram atualizados.',
      counts: backupFile.metadata.counts,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('Error during restore, attempting rollback:', err);
    try {
      const safetyRaw = localStorage.getItem(SAFETY_BACKUP_KEY);
      if (safetyRaw) {
        const safetyFile = JSON.parse(safetyRaw);
        restoreBackupData(safetyFile, 'replace');
      }
    } catch (e) {
      console.error('Rollback failed:', e);
    }

    return {
      success: false,
      message: `Falha na restauração do backup: ${errorMsg}. Operação desfeita por segurança.`,
      counts: null,
    };
  }
}
