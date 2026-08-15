/**
 * DevDock Central Storage Keys Registry
 * Namespaced keys for client-side LocalStorage persistence.
 */

export const STORAGE_KEYS = {
  // Core Modules
  PROJECTS: 'devdock:projects_v1',
  STUDIES: 'devdock:studies_v2',
  ACADEMIC: 'devdock:academic_v1',
  CALENDAR: 'devdock:calendar_v1',
  PLANNER: 'devdock:planner_v1',

  // Pomodoro Timer State
  POMODORO_SETTINGS: 'devdock:pomodoro_settings_v1',
  POMODORO_SESSIONS: 'devdock:pomodoro_sessions_v1',
  POMODORO_TOTAL_FOCUS: 'devdock:pomodoro_total_focus_v1',
  POMODORO_DAILY_GOAL: 'devdock:pomodoro_daily_goal_v1',
  POMODORO_VOLUME: 'devdock:pomodoro_volume_v1',
  POMODORO_RECORDS: 'devdock:pomodoro_session_records_v1',
  POMODORO_TASKS: 'devdock:pomodoro_tasks_v1',
  POMODORO_ACTIVE_TASK: 'devdock:pomodoro_active_task_v1',

  // Settings & Theme
  THEME: 'devdock:theme_preference_v1',
  NOTIFICATIONS: 'devdock:notification_preferences_v1',

  // Auth & Cloud Fallback
  CURRENT_USER: 'devdock:current_user_v1',
  CLOUD_DB: 'devdock:cloud_db_v1',
  SAFETY_BACKUP: 'devdock:safety_auto_backup_temp',
  MIGRATION_DONE: 'devdock:migration_done_v1',

  // Legacy Keys (for backward-compatible migrations)
  LEGACY_PROJECTS: 'devdock_projects_data_v1',
  LEGACY_STUDIES: 'devdock_studies_data_v2',
  LEGACY_ACADEMIC: 'devdock_academic_data_v1',
  LEGACY_CALENDAR: 'devdock_calendar_events_v1',
  LEGACY_PLANNER: 'devdock_planner_activities_v1',
  LEGACY_POMODORO_SETTINGS: 'pomodoro_settings_v1',
  LEGACY_POMODORO_SESSIONS: 'pomodoro_sessions_v1',
  LEGACY_POMODORO_TOTAL_FOCUS: 'pomodoro_total_focus_minutes_v1',
  LEGACY_POMODORO_DAILY_GOAL: 'pomodoro_daily_goal_v1',
  LEGACY_POMODORO_VOLUME: 'pomodoro_volume_v1',
  LEGACY_POMODORO_RECORDS: 'pomodoro_session_records_v1',
  LEGACY_POMODORO_TASKS: 'pomodoro_tasks_v1',
  LEGACY_POMODORO_ACTIVE_TASK: 'pomodoro_active_task_v1',
  LEGACY_THEME: 'devdock_theme_preference_v1',
  LEGACY_NOTIFICATIONS: 'devdock_notification_preferences_v1',
} as const;

export type StorageKeyName = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
