import { SessionRecord, ProductivityDayData, AnalyticsSummary } from '@/types/analytics';

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const FULL_DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

/**
 * Gets formatted date string YYYY-MM-DD in local time
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets formatted time string HH:MM in local time
 */
export function getLocalTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats a YYYY-MM-DD date string to DD/MM/YYYY
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Calculates current streak of consecutive days with at least 1 focus/stopwatch session
 */
export function calculateStreak(records: SessionRecord[]): number {
  if (!records || records.length === 0) return 0;

  const focusRecords = records.filter((r) => r.mode === 'focus' || r.mode === 'stopwatch');
  if (focusRecords.length === 0) return 0;

  const activeDates = new Set(focusRecords.map((r) => r.dateString));

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let checkDate = activeDates.has(todayStr) ? new Date() : yesterday;

  while (true) {
    const dateStr = getLocalDateString(checkDate);
    if (activeDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Finds the day of the week with the highest total focus time
 */
export function calculateBestDayOfWeek(records: SessionRecord[]): string {
  const focusRecords = records.filter((r) => r.mode === 'focus' || r.mode === 'stopwatch');
  if (focusRecords.length === 0) return 'Nenhum ainda';

  const dayTotals: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  focusRecords.forEach((r) => {
    const d = new Date(r.timestamp);
    const dayOfWeek = d.getDay();
    dayTotals[dayOfWeek] += r.durationMinutes;
  });

  let maxMinutes = -1;
  let bestDayIndex = 0;

  Object.entries(dayTotals).forEach(([dayIdx, totalMins]) => {
    if (totalMins > maxMinutes) {
      maxMinutes = totalMins;
      bestDayIndex = Number(dayIdx);
    }
  });

  return maxMinutes > 0 ? FULL_DAY_NAMES[bestDayIndex] : 'Nenhum ainda';
}

/**
 * Calculates daily average focus minutes based on unique active days
 */
export function calculateDailyAverage(records: SessionRecord[]): number {
  const focusRecords = records.filter((r) => r.mode === 'focus' || r.mode === 'stopwatch');
  if (focusRecords.length === 0) return 0;

  const uniqueDays = new Set(focusRecords.map((r) => r.dateString)).size;
  const totalMins = focusRecords.reduce((sum, r) => sum + r.durationMinutes, 0);

  return uniqueDays > 0 ? Math.round(totalMins / uniqueDays) : 0;
}

/**
 * Generates 7-day productivity chart data for the past week up to today
 */
export function getChartDataForLast7Days(records: SessionRecord[]): ProductivityDayData[] {
  const focusRecords = records.filter((r) => r.mode === 'focus' || r.mode === 'stopwatch');
  const todayStr = getLocalDateString(new Date());
  const chartData: ProductivityDayData[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayIdx = d.getDay();

    const daySessions = focusRecords.filter((r) => r.dateString === dateStr);
    const totalMins = daySessions.reduce((sum, r) => sum + r.durationMinutes, 0);

    chartData.push({
      dayLabel: DAY_NAMES[dayIdx],
      dateString: dateStr,
      minutes: totalMins,
      count: daySessions.length,
      isToday: dateStr === todayStr,
    });
  }

  return chartData;
}

/**
 * Calculates complete summary metrics
 */
export function getAnalyticsSummary(
  records: SessionRecord[],
  totalFocusMinutes: number,
  dailyGoal: number
): AnalyticsSummary {
  const focusRecords = records.filter((r) => r.mode === 'focus' || r.mode === 'stopwatch');
  const todayStr = getLocalDateString(new Date());

  const todaySessions = focusRecords.filter((r) => r.dateString === todayStr);
  const todayCount = todaySessions.length;
  const todayMinutes = todaySessions.reduce((sum, r) => sum + r.durationMinutes, 0);

  const todayProgressPercent = dailyGoal > 0 ? Math.min(100, Math.round((todayCount / dailyGoal) * 100)) : 0;

  const chartData = getChartDataForLast7Days(records);
  const weeklyMinutes = chartData.reduce((sum, d) => sum + d.minutes, 0);

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyMinutes = focusRecords
    .filter((r) => r.dateString.startsWith(currentMonthPrefix))
    .reduce((sum, r) => sum + r.durationMinutes, 0);

  const hours = (totalFocusMinutes / 60).toFixed(1);

  return {
    todayCount,
    todayMinutes,
    dailyGoal,
    todayProgressPercent,
    totalFocusMinutes,
    totalFocusHours: hours,
    streakDays: calculateStreak(records),
    dailyAverageMinutes: calculateDailyAverage(records),
    bestDayOfWeek: calculateBestDayOfWeek(records),
    weeklyMinutes,
    monthlyMinutes,
    chartData,
  };
}
