import { TimerMode } from '@/hooks/usePomodoroTimer';

export type SessionStatus = 'COMPLETED' | 'SKIPPED' | 'RESET' | 'CANCELLED';

export interface SessionRecord {
  id: string;
  timestamp: number;              // Date.now() when recorded
  dateString: string;             // "YYYY-MM-DD"
  timeString: string;             // "14:30"
  durationMinutes: number;        // Legacy field for backward compatibility (actualDurationSeconds / 60)
  configuredDurationSeconds: number; // e.g. 1500 (25 mins)
  actualDurationSeconds: number;     // e.g. 452 (7m 32s)
  status: SessionStatus;          // 'COMPLETED' | 'SKIPPED' | 'RESET' | 'CANCELLED'
  mode: TimerMode;
  startedAt: number;              // Timestamp
  endedAt: number;                // Timestamp
  projectId?: string;
  taskId?: string;
}

export interface ProductivityDayData {
  dayLabel: string;        // "Dom", "Seg", "Ter", etc.
  dateString: string;      // "YYYY-MM-DD"
  minutes: number;         // Total focus minutes on that day (actualDuration)
  count: number;           // Number of completed focus sessions on that day
  isToday: boolean;
}

export interface AnalyticsSummary {
  todayCount: number;
  todayMinutes: number;
  dailyGoal: number;
  todayProgressPercent: number;
  totalFocusMinutes: number;
  totalFocusHours: string;
  streakDays: number;
  dailyAverageMinutes: number;
  bestDayOfWeek: string;
  weeklyMinutes: number;
  monthlyMinutes: number;
  chartData: ProductivityDayData[];
}
