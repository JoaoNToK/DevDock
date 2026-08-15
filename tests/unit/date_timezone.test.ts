import { formatYMD, parseYMD, formatDateBR, isSameLocalDay, isToday, getStartOfLocalWeek, getEndOfLocalWeek } from '../../src/lib/date';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed]: ${message}`);
  }
}

export function runDateTimezoneTests() {
  console.log('🧪 Running Date & Timezone Tests...');

  // Test 1: formatYMD & parseYMD roundtrip
  const now = new Date(2026, 7, 15, 23, 59, 59); // 2026-08-15 23:59:59 local
  const ymd = formatYMD(now);
  assert(ymd === '2026-08-15', `Expected '2026-08-15', got '${ymd}'`);

  const parsed = parseYMD('2026-08-15');
  assert(parsed.getFullYear() === 2026, 'Parsed year must be 2026');
  assert(parsed.getMonth() === 7, 'Parsed month must be August (index 7)');
  assert(parsed.getDate() === 15, 'Parsed date must be 15');

  // Test 2: Midnight Boundary (00:00:00)
  const midnight = new Date(2026, 7, 15, 0, 0, 0);
  const ymdMidnight = formatYMD(midnight);
  assert(ymdMidnight === '2026-08-15', `Midnight date should be '2026-08-15', got '${ymdMidnight}'`);

  // Test 3: Midnight Boundary (23:59:59) - Must NEVER shift to previous day
  const endOfDay = new Date(2026, 7, 15, 23, 59, 59, 999);
  const ymdEnd = formatYMD(endOfDay);
  assert(ymdEnd === '2026-08-15', `End of day date should be '2026-08-15', got '${ymdEnd}'`);

  // Test 4: Brazilian Portuguese Date Formatting
  const formattedBR = formatDateBR('2026-08-15');
  assert(formattedBR === '15/08/2026', `Expected '15/08/2026', got '${formattedBR}'`);

  // Test 5: Same Local Day Check
  assert(isSameLocalDay('2026-08-15', '2026-08-15'), 'Same YMD strings must be equal');
  assert(!isSameLocalDay('2026-08-15', '2026-08-16'), 'Different YMD strings must not be equal');

  // Test 6: Week start (Monday) and end (Sunday) calculation
  const wednesday = new Date(2026, 7, 12, 14, 30); // Aug 12, 2026 is Wednesday
  const monday = getStartOfLocalWeek(wednesday);
  const sunday = getEndOfLocalWeek(wednesday);

  assert(monday.getDay() === 1, 'Start of week must be Monday (day 1)');
  assert(monday.getDate() === 10, `Start of week date should be 10, got ${monday.getDate()}`);
  assert(sunday.getDay() === 0, 'End of week must be Sunday (day 0)');
  assert(sunday.getDate() === 16, `End of week date should be 16, got ${sunday.getDate()}`);

  console.log('✅ Date & Timezone Tests PASSED (6/6)');
}
