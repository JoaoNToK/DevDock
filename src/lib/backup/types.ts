/**
 * DevDock Professional Backup Types & Data Contracts
 * 
 * Version 1 Specifications
 */

export interface DevDockBackupMetadata {
  format: 'DevDock Backup';
  version: number;
  exportedAt: string; // ISO string
  appName: string;
  userEmail?: string;
  counts: {
    projects: number;
    tasks: number;
    calendarEvents: number;
    plannerActivities: number;
    subjects: number;
    academicAssignments: number;
    notes: number;
    pomodoroRecords: number;
    goals: number;
  };
}

export interface DevDockBackupSettings {
  theme?: 'light' | 'dark' | 'system';
  notifications?: Record<string, any>;
  pomodoro?: {
    focus: number;
    shortBreak: number;
    longBreak: number;
    volume: number;
    dailyGoal: number;
  };
}

export interface DevDockBackupPomodoro {
  totalFocusMinutes: number;
  completedSessions: number;
  dailyGoal: number;
  volume: number;
  sessionRecords: any[];
  tasks: any[];
}

export interface DevDockBackupFile {
  format: 'DevDock Backup';
  version: number;
  exportedAt: string;
  metadata: DevDockBackupMetadata;
  data: {
    settings: DevDockBackupSettings;
    pomodoro: DevDockBackupPomodoro;
    calendarEvents: any[];
    plannerActivities: any[];
    studiesData: any;
    academicData: any;
    projectsData: any;
  };
}

export interface BackupValidationResult {
  isValid: boolean;
  version: number;
  exportedAt?: string;
  summary?: DevDockBackupMetadata['counts'];
  errors: string[];
  warnings: string[];
}

export type RestoreMode = 'replace' | 'merge';
