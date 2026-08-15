/**
 * DevDock Professional Backup Types & Data Contracts
 * 
 * Version 1 Specifications
 */

import { CalendarEvent } from '@/types/calendar';
import { PlannerActivity } from '@/types/planner';
import { SessionRecord } from '@/types/analytics';
import { Task } from '@/types/task';
import { StudiesData } from '@/types/studies';
import { AcademicData } from '@/types/academic';
import { ProjectsData } from '@/types/projects';

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
  notifications?: Record<string, boolean | string | number>;
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
  sessionRecords: SessionRecord[];
  tasks: Task[];
}

export interface DevDockBackupFile {
  format: 'DevDock Backup';
  version: number;
  exportedAt: string;
  metadata: DevDockBackupMetadata;
  data: {
    settings: DevDockBackupSettings;
    pomodoro: DevDockBackupPomodoro;
    calendarEvents: CalendarEvent[];
    plannerActivities: PlannerActivity[];
    studiesData: StudiesData;
    academicData: AcademicData;
    projectsData: ProjectsData;
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
