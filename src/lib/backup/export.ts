import { DevDockBackupFile, DevDockBackupMetadata } from './types';
import { STORAGE_KEYS, storageAdapter } from '@/lib/storage';

/**
 * Exports all local DevDock application state into a unified, versioned JSON backup object.
 */
export function generateDevDockBackup(userEmail?: string): DevDockBackupFile {
  const exportedAt = new Date().toISOString();

  // 1. Settings & Preferences
  const theme = storageAdapter.getRaw(
    STORAGE_KEYS.THEME,
    storageAdapter.getRaw(STORAGE_KEYS.LEGACY_THEME, 'system')
  ) as 'light' | 'dark' | 'system';

  const notifications = storageAdapter.get<Record<string, boolean | string | number>>(
    STORAGE_KEYS.NOTIFICATIONS,
    storageAdapter.get(STORAGE_KEYS.LEGACY_NOTIFICATIONS, {})
  );

  const pomodoroSettings = storageAdapter.get(
    STORAGE_KEYS.POMODORO_SETTINGS,
    storageAdapter.get(STORAGE_KEYS.LEGACY_POMODORO_SETTINGS, { focus: 25, shortBreak: 5, longBreak: 15 })
  );

  const volume = Number(
    storageAdapter.getRaw(STORAGE_KEYS.POMODORO_VOLUME, storageAdapter.getRaw(STORAGE_KEYS.LEGACY_POMODORO_VOLUME, '0.8'))
  ) || 0.8;

  const dailyGoal = Number(
    storageAdapter.getRaw(STORAGE_KEYS.POMODORO_DAILY_GOAL, storageAdapter.getRaw(STORAGE_KEYS.LEGACY_POMODORO_DAILY_GOAL, '8'))
  ) || 8;

  // 2. Pomodoro Data
  const completedSessions = Number(
    storageAdapter.getRaw(STORAGE_KEYS.POMODORO_SESSIONS, storageAdapter.getRaw(STORAGE_KEYS.LEGACY_POMODORO_SESSIONS, '0'))
  ) || 0;

  const totalFocusMinutes = Number(
    storageAdapter.getRaw(STORAGE_KEYS.POMODORO_TOTAL_FOCUS, storageAdapter.getRaw(STORAGE_KEYS.LEGACY_POMODORO_TOTAL_FOCUS, '0'))
  ) || 0;

  const sessionRecords = storageAdapter.get(
    STORAGE_KEYS.POMODORO_RECORDS,
    storageAdapter.get(STORAGE_KEYS.LEGACY_POMODORO_RECORDS, [])
  );

  const pomodoroTasks = storageAdapter.get(
    STORAGE_KEYS.POMODORO_TASKS,
    storageAdapter.get(STORAGE_KEYS.LEGACY_POMODORO_TASKS, [])
  );

  // 3. Calendar & Planner
  const calendarEvents = storageAdapter.get(
    STORAGE_KEYS.CALENDAR,
    storageAdapter.get(STORAGE_KEYS.LEGACY_CALENDAR, [])
  );

  const plannerActivities = storageAdapter.get(
    STORAGE_KEYS.PLANNER,
    storageAdapter.get(STORAGE_KEYS.LEGACY_PLANNER, [])
  );

  // 4. Studies & Academic
  const studiesData = storageAdapter.get(
    STORAGE_KEYS.STUDIES,
    storageAdapter.get(STORAGE_KEYS.LEGACY_STUDIES, {
      subjects: [],
      topics: [],
      notes: [],
      goals: [],
      resources: [],
    })
  );

  const academicData = storageAdapter.get(
    STORAGE_KEYS.ACADEMIC,
    storageAdapter.get(STORAGE_KEYS.LEGACY_ACADEMIC, {
      course: { name: '', institution: '', currentSemesterName: '', currentPeriod: '', year: new Date().getFullYear() },
      semesters: [],
      subjects: [],
      assignments: [],
    })
  );

  // 5. Projects & Kanban
  const projectsData = storageAdapter.get(
    STORAGE_KEYS.PROJECTS,
    storageAdapter.get(STORAGE_KEYS.LEGACY_PROJECTS, {
      projects: [],
      columns: [],
      tasks: [],
      notes: [],
      docs: [],
      goals: [],
      resources: [],
      timeline: [],
    })
  );

  // Counts metadata for summary display
  const counts: DevDockBackupMetadata['counts'] = {
    projects: Array.isArray(projectsData.projects) ? projectsData.projects.length : 0,
    tasks: (Array.isArray(projectsData.tasks) ? projectsData.tasks.length : 0) + (Array.isArray(pomodoroTasks) ? pomodoroTasks.length : 0),
    calendarEvents: Array.isArray(calendarEvents) ? calendarEvents.length : 0,
    plannerActivities: Array.isArray(plannerActivities) ? plannerActivities.length : 0,
    subjects: (Array.isArray(studiesData.subjects) ? studiesData.subjects.length : 0) + (Array.isArray(academicData.subjects) ? academicData.subjects.length : 0),
    academicAssignments: Array.isArray(academicData.assignments) ? academicData.assignments.length : 0,
    notes: (Array.isArray(studiesData.notes) ? studiesData.notes.length : 0) + (Array.isArray(projectsData.notes) ? projectsData.notes.length : 0),
    pomodoroRecords: Array.isArray(sessionRecords) ? sessionRecords.length : 0,
    goals: (Array.isArray(studiesData.goals) ? studiesData.goals.length : 0) + (Array.isArray(projectsData.goals) ? projectsData.goals.length : 0),
  };

  return {
    format: 'DevDock Backup',
    version: 1,
    exportedAt,
    metadata: {
      format: 'DevDock Backup',
      version: 1,
      exportedAt,
      appName: 'DevDock Platform',
      userEmail,
      counts,
    },
    data: {
      settings: {
        theme,
        notifications,
        pomodoro: {
          ...pomodoroSettings,
          volume,
          dailyGoal,
        },
      },
      pomodoro: {
        totalFocusMinutes,
        completedSessions,
        dailyGoal,
        volume,
        sessionRecords,
        tasks: pomodoroTasks,
      },
      calendarEvents,
      plannerActivities,
      studiesData,
      academicData,
      projectsData,
    },
  };
}

/**
 * Triggers a browser file download of the backup JSON.
 */
export function exportBackupToFile(userNameOrEmail?: string): { filename: string; backup: DevDockBackupFile } {
  const backup = generateDevDockBackup(userNameOrEmail);
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateSlug = new Date().toISOString().split('T')[0];
  const filename = `devdock-backup-${dateSlug}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { filename, backup };
}
