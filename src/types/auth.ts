import { TimerSettings } from '@/hooks/usePomodoroTimer';
import { SessionRecord } from '@/types/analytics';
import { Task } from '@/types/task';

export type AuthProviderType = 'email' | 'google';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: AuthProviderType;
  createdAt: number;
}

export interface CloudUserData {
  settings: TimerSettings;
  sessionRecords: SessionRecord[];
  tasks: Task[];
  totalFocusMinutes: number;
  completedSessions: number;
  dailyGoal: number;
  volume: number;
  lastSyncedAt: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
