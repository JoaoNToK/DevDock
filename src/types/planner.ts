export interface PlannerActivity {
  id: string;
  title: string;
  description?: string;
  dateString: string; // YYYY-MM-DD
  dayOfWeek?: number; // 0-6 (Sun-Sat)
  startTime: string;  // HH:MM
  durationMinutes: number;
  isCompleted: boolean;
  category: 'Estudos' | 'Trabalho' | 'Pessoal' | 'Saúde' | 'Outros';
  pomodoroTaskId?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface DailyGoalConfig {
  targetHours: number;
  targetPomodoros: number;
  note?: string;
}
