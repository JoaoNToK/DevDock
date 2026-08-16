import { DevDockBackupFile, RestoreMode } from './types';
import { generateDevDockBackup } from './export';
import { STORAGE_KEYS, storageAdapter } from '@/lib/storage';

export interface RestoreResult {
  success: boolean;
  message: string;
  safetyBackupSaved: boolean;
}

/**
 * Generic helper to deduplicate array items by ID during merge restores.
 */
function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  existing.forEach((item) => map.set(item.id, item));
  incoming.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

/**
 * Restores application state from a validated DevDock backup file.
 */
export function executeRestore(backupFile: DevDockBackupFile, mode: RestoreMode = 'replace'): RestoreResult {
  if (typeof window === 'undefined') {
    throw new Error('Backup restore must run in browser environment.');
  }

  // 1. Create Safety Backup of current state before any operation
  let safetyBackupSaved = false;
  try {
    const currentData = generateDevDockBackup();
    storageAdapter.set(STORAGE_KEYS.SAFETY_BACKUP, currentData);
    safetyBackupSaved = true;
  } catch (e) {
    console.warn('Could not store temporary safety backup:', e);
  }

  try {
    const d = backupFile.data;

    if (mode === 'replace') {
      // CLEAR & REPLACE MODE

      // 1. Settings & Preferences
      if (d.settings?.theme) {
        storageAdapter.set(STORAGE_KEYS.THEME, d.settings.theme);
        document.documentElement.classList.remove('dark', 'light');
        if (d.settings.theme === 'dark' || (d.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else if (d.settings.theme === 'light') {
          document.documentElement.classList.add('light');
        }
      }

      if (d.settings?.notifications) {
        storageAdapter.set(STORAGE_KEYS.NOTIFICATIONS, d.settings.notifications);
      }

      if (d.settings?.pomodoro) {
        storageAdapter.set(STORAGE_KEYS.POMODORO_SETTINGS, {
          focus: d.settings.pomodoro.focus || 25,
          shortBreak: d.settings.pomodoro.shortBreak || 5,
          longBreak: d.settings.pomodoro.longBreak || 15,
        });
      }

      // 2. Pomodoro Data
      if (d.pomodoro) {
        storageAdapter.set(STORAGE_KEYS.POMODORO_SESSIONS, d.pomodoro.completedSessions || 0);
        storageAdapter.set(STORAGE_KEYS.POMODORO_TOTAL_FOCUS, d.pomodoro.totalFocusMinutes || 0);
        storageAdapter.set(STORAGE_KEYS.POMODORO_DAILY_GOAL, d.pomodoro.dailyGoal || 8);
        storageAdapter.set(STORAGE_KEYS.POMODORO_VOLUME, d.pomodoro.volume || 0.8);
        storageAdapter.set(STORAGE_KEYS.POMODORO_RECORDS, d.pomodoro.sessionRecords || []);
        storageAdapter.set(STORAGE_KEYS.POMODORO_TASKS, d.pomodoro.tasks || []);
      }

      // 3. Calendar & Planner
      storageAdapter.set(STORAGE_KEYS.CALENDAR, d.calendarEvents || []);
      storageAdapter.set(STORAGE_KEYS.PLANNER, d.plannerActivities || []);

      // 4. Studies & Academic
      storageAdapter.set(STORAGE_KEYS.STUDIES, d.studiesData || {
        subjects: [],
        topics: [],
        notes: [],
        goals: [],
        resources: [],
      });

      storageAdapter.set(STORAGE_KEYS.ACADEMIC, d.academicData || {
        course: null,
        semesters: [],
        subjects: [],
        assignments: [],
      });

      // 5. Projects & Kanban
      storageAdapter.set(STORAGE_KEYS.PROJECTS, d.projectsData || {
        projects: [],
        columns: [],
        tasks: [],
        notes: [],
        docs: [],
        goals: [],
        resources: [],
        timeline: [],
      });

      // 6. Categories
      if (Array.isArray((d as any).categories)) {
        storageAdapter.set('devdock:categories_v1', (d as any).categories);
      }
    } else {
      // MERGE MODE (Smart non-destructive merge)

      // Calendar Events
      const curCal = storageAdapter.get(STORAGE_KEYS.CALENDAR, []);
      storageAdapter.set(STORAGE_KEYS.CALENDAR, mergeById(curCal, d.calendarEvents || []));

      // Planner Activities
      const curPlan = storageAdapter.get(STORAGE_KEYS.PLANNER, []);
      storageAdapter.set(STORAGE_KEYS.PLANNER, mergeById(curPlan, d.plannerActivities || []));

      // Pomodoro Records & Tasks
      const curPomoRecs = storageAdapter.get(STORAGE_KEYS.POMODORO_RECORDS, []);
      storageAdapter.set(STORAGE_KEYS.POMODORO_RECORDS, mergeById(curPomoRecs, d.pomodoro?.sessionRecords || []));

      const curPomoTasks = storageAdapter.get(STORAGE_KEYS.POMODORO_TASKS, []);
      storageAdapter.set(STORAGE_KEYS.POMODORO_TASKS, mergeById(curPomoTasks, d.pomodoro?.tasks || []));

      // Studies Data
      const curStud = storageAdapter.get(STORAGE_KEYS.STUDIES, { subjects: [], topics: [], notes: [], goals: [], resources: [] });
      storageAdapter.set(STORAGE_KEYS.STUDIES, {
        subjects: mergeById(curStud.subjects || [], d.studiesData?.subjects || []),
        topics: mergeById(curStud.topics || [], d.studiesData?.topics || []),
        notes: mergeById(curStud.notes || [], d.studiesData?.notes || []),
        goals: mergeById(curStud.goals || [], d.studiesData?.goals || []),
        resources: mergeById(curStud.resources || [], d.studiesData?.resources || []),
      });

      // Academic Data
      const curAcad = storageAdapter.get(STORAGE_KEYS.ACADEMIC, { course: null, semesters: [], subjects: [], assignments: [] });
      storageAdapter.set(STORAGE_KEYS.ACADEMIC, {
        course: curAcad.course || d.academicData?.course || null,
        semesters: mergeById(curAcad.semesters || [], d.academicData?.semesters || []),
        subjects: mergeById(curAcad.subjects || [], d.academicData?.subjects || []),
        assignments: mergeById(curAcad.assignments || [], d.academicData?.assignments || []),
      });

      // Projects Data
      const curProj = storageAdapter.get(STORAGE_KEYS.PROJECTS, {
        projects: [],
        columns: [],
        tasks: [],
        notes: [],
        docs: [],
        goals: [],
        resources: [],
        timeline: [],
      });

      storageAdapter.set(STORAGE_KEYS.PROJECTS, {
        projects: mergeById(curProj.projects || [], d.projectsData?.projects || []),
        columns: mergeById(curProj.columns || [], d.projectsData?.columns || []),
        tasks: mergeById(curProj.tasks || [], d.projectsData?.tasks || []),
        notes: mergeById(curProj.notes || [], d.projectsData?.notes || []),
        docs: mergeById(curProj.docs || [], d.projectsData?.docs || []),
        goals: mergeById(curProj.goals || [], d.projectsData?.goals || []),
        resources: mergeById(curProj.resources || [], d.projectsData?.resources || []),
        timeline: mergeById(curProj.timeline || [], d.projectsData?.timeline || []),
      });
    }

    // Trigger reactive UI update event across all open hooks & components
    window.dispatchEvent(new Event('devdock-backup-restored'));

    return {
      success: true,
      message: `Restauração (${mode === 'replace' ? 'Substituição Completa' : 'Mesclagem'}) concluída com sucesso!`,
      safetyBackupSaved,
    };
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Erro desconhecido durante a restauração.';
    console.error('Failed to execute restore:', e);
    return {
      success: false,
      message: `Falha na restauração: ${errorMsg}`,
      safetyBackupSaved,
    };
  }
}
