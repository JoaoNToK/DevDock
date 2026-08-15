/**
 * DevDock Centralized Local Date & Timezone Utilities
 * 
 * Rules:
 * 1. CIVIL DATES (YYYY-MM-DD): Used for exams, assignments, due dates, planning days, calendar dates.
 *    -> Never use `.toISOString()` on civil dates as it introduces UTC timezone offsets (-1/+1 day shifts near midnight).
 * 2. TIMESTAMPS: Used for createdAt, updatedAt, startedAt, completedAt logs.
 *    -> Uses ISO string or ISO Date representing absolute instants in time.
 * 3. DATE + TIME: Used for calendar meetings/events with local hours (HH:mm).
 */

/**
 * Format a Date object as a local civil date string 'YYYY-MM-DD'
 */
export function formatYMD(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's local civil date string 'YYYY-MM-DD'
 */
export function getTodayYMD(): string {
  return formatYMD(new Date());
}

/**
 * Parse a 'YYYY-MM-DD' string into a local Date object set at 00:00:00 local time
 */
export function parseYMD(ymdStr: string): Date {
  if (!ymdStr) return new Date();
  const [yearStr, monthStr, dayStr] = ymdStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Format a 'YYYY-MM-DD' string or Date object into Brazilian Portuguese format 'DD/MM/YYYY'
 */
export function formatDateBR(ymdOrDate: string | Date): string {
  if (!ymdOrDate) return '';
  if (typeof ymdOrDate === 'string') {
    if (ymdOrDate.includes('T')) {
      const d = new Date(ymdOrDate);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
    const [year, month, day] = ymdOrDate.split('-');
    if (year && month && day) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  }
  const date = ymdOrDate as Date;
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

/**
 * Format a civil date and optional time into 'DD/MM/YYYY às HH:mm'
 */
export function formatDateTimeBR(ymdOrDate: string | Date, timeStr?: string): string {
  const dateFormatted = formatDateBR(ymdOrDate);
  if (timeStr) {
    return `${dateFormatted} às ${timeStr}`;
  }
  return dateFormatted;
}

/**
 * Check if two dates/strings represent the exact same local day ('YYYY-MM-DD')
 */
export function isSameLocalDay(d1: string | Date, d2: string | Date): boolean {
  const str1 = typeof d1 === 'string' ? (d1.includes('T') ? formatYMD(new Date(d1)) : d1) : formatYMD(d1);
  const str2 = typeof d2 === 'string' ? (d2.includes('T') ? formatYMD(new Date(d2)) : d2) : formatYMD(d2);
  return str1 === str2;
}

/**
 * Check if a date string or Date object represents today in local time
 */
export function isToday(d: string | Date): boolean {
  return isSameLocalDay(d, getTodayYMD());
}

/**
 * Get local Monday 00:00:00 of the week for a given date
 */
export function getStartOfLocalWeek(date: Date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + distanceToMonday);
  return d;
}

/**
 * Get local Sunday 23:59:59 of the week for a given date
 */
export function getEndOfLocalWeek(date: Date = new Date()): Date {
  const monday = getStartOfLocalWeek(date);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Get user's system timezone string (e.g. 'America/Sao_Paulo')
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'America/Sao_Paulo';
  }
}
