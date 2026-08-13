import { TimerMode } from '@/hooks/usePomodoroTimer';

export interface SessionRecord {
  id: string;
  timestamp: number;        // Date.now()
  dateString: string;       // "YYYY-MM-DD"
  timeString: string;       // "14:30"
  durationMinutes: number;  // e.g. 25
  mode: TimerMode;
}

export interface ProductivityDayData {
  dayLabel: string;        // "Dom", "Seg", "Ter", etc.
  dateString: string;      // "YYYY-MM-DD"
  minutes: number;         // Total focus minutes on that day
  count: number;           // Number of focus sessions on that day
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
