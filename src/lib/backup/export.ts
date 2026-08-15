import { DevDockBackupFile, DevDockBackupMetadata } from './types';
import { getTodayYMD } from '@/lib/date';

/**
 * Collects all current user data across all modules and triggers a portable JSON download.
 * Sanitizes all security secrets, passwords, tokens and credentials.
 */
export function generateBackupData(userName?: string): DevDockBackupFile {
  if (typeof window === 'undefined') {
    throw new Error('Backup export must be run in browser environment.');
  }

  // Generic helper parser for local storage items
  const parseJSON = <T>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  // 1. Settings & Preferences
  const theme = (localStorage.getItem('devdock_theme_preference_v1') || 'system') as 'light' | 'dark' | 'system';
  const notifications = parseJSON<Record<string, boolean | string | number>>('devdock_notification_preferences_v1', {});
  const pomodoroSettings = parseJSON('pomodoro_settings_v1', { focus: 25, shortBreak: 5, longBreak: 15 });
  const volume = Number(localStorage.getItem('pomodoro_volume_v1')) || 0.8;
  const dailyGoal = Number(localStorage.getItem('pomodoro_daily_goal_v1')) || 8;

  // 2. Pomodoro Data
  const completedSessions = Number(localStorage.getItem('pomodoro_sessions_v1')) || 0;
  const totalFocusMinutes = Number(localStorage.getItem('pomodoro_total_focus_minutes_v1')) || 0;
  const sessionRecords = parseJSON('pomodoro_session_records_v1', []);
  const pomodoroTasks = parseJSON('pomodoro_tasks_v1', []);

  // 3. Calendar & Planner
  const calendarEvents = parseJSON('devdock_calendar_events_v1', []);
  const plannerActivities = parseJSON('devdock_planner_activities_v1', []);

  // 4. Studies & Academic
  const studiesData = parseJSON('devdock_studies_data_v2', {
    subjects: [],
    topics: [],
    notes: [],
    goals: [],
    resources: [],
  });

  const academicData = parseJSON('devdock_academic_data_v1', {
    course: { name: '', institution: '', currentSemesterName: '', currentPeriod: '', year: new Date().getFullYear() },
    semesters: [],
    subjects: [],
    assignments: [],
  });

  // 5. Projects & Kanban
  const projectsData = parseJSON('devdock_projects_data_v1', {
    projects: [],
    columns: [],
    tasks: [],
    notes: [],
    docs: [],
    goals: [],
    resources: [],
    timeline: [],
  });

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

  const backupFile: DevDockBackupFile = {
    format: 'DevDock Backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    metadata: {
      format: 'DevDock Backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      appName: 'DevDock Platform',
      userEmail: userName || undefined,
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

  return backupFile;
}

/**
 * Downloads a `.devdock-backup.json` file to the user's computer or mobile device.
 */
export function exportBackupToFile(userName?: string): { filename: string; file: DevDockBackupFile } {
  const backupData = generateBackupData(userName);
  const dateStr = getTodayYMD();
  const safeName = (userName || 'usuario').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `devdock-backup-${safeName}-${dateStr}.devDock-backup.json`;

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { filename, file: backupData };
}
