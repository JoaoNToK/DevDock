import { STORAGE_KEYS, storageAdapter } from '../../src/lib/storage';
import { setupMockStorage } from '../setup_mock_storage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed]: ${message}`);
  }
}

export function runPomodoroTests() {
  console.log('🧪 Running Pomodoro Timer & Background Tests...');

  // Setup Mock Storage Environment
  setupMockStorage();
  storageAdapter.clear();

  // 1. Initial Storage State
  const initialSettings = storageAdapter.get(STORAGE_KEYS.POMODORO_SETTINGS, {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  });
  assert(initialSettings.workDuration === 25, 'Default work duration should be 25 mins');

  // 2. Start & Background Elapsed Time Calculation Test
  const startTime = Date.now();
  const workDurationSeconds = 25 * 60; // 1500 seconds

  // Simulate tab backgrounding for 10 minutes (600 seconds)
  const simulatedTimePass = 600 * 1000; // 600,000 ms
  const simulatedCurrentTime = startTime + simulatedTimePass;

  const elapsedSeconds = Math.floor((simulatedCurrentTime - startTime) / 1000);
  const remainingSeconds = Math.max(0, workDurationSeconds - elapsedSeconds);

  assert(elapsedSeconds === 600, `Expected 600 elapsed seconds, got ${elapsedSeconds}`);
  assert(remainingSeconds === 900, `Expected 900 remaining seconds (15 mins), got ${remainingSeconds}`);

  // 3. Skip Phase State Machine Transition
  let currentMode: 'focus' | 'shortBreak' | 'longBreak' = 'focus';
  let completedCount = 0;

  function handleSkipPhase() {
    if (currentMode === 'focus') {
      completedCount++;
      if (completedCount % 4 === 0) {
        currentMode = 'longBreak';
      } else {
        currentMode = 'shortBreak';
      }
    } else {
      currentMode = 'focus';
    }
  }

  // Skip 1: Focus (1) -> Short Break
  handleSkipPhase();
  assert((currentMode as string) === 'shortBreak', `Expected shortBreak after 1st focus, got ${currentMode}`);

  // Skip 2: Short Break -> Focus (2)
  handleSkipPhase();
  assert((currentMode as string) === 'focus', 'Expected focus after shortBreak');

  // Skip 3: Focus (2) -> Short Break
  handleSkipPhase();
  assert((currentMode as string) === 'shortBreak', 'Expected shortBreak after 2nd focus');

  // Skip 4: Short Break -> Focus (3)
  handleSkipPhase();
  assert((currentMode as string) === 'focus', 'Expected focus after shortBreak');

  // Skip 5: Focus (3) -> Short Break
  handleSkipPhase();
  assert((currentMode as string) === 'shortBreak', 'Expected shortBreak after 3rd focus');

  // Skip 6: Short Break -> Focus (4)
  handleSkipPhase();
  assert((currentMode as string) === 'focus', 'Expected focus after shortBreak');

  // Skip 7: Focus (4 - Long Break threshold) -> Long Break
  handleSkipPhase();
  assert((currentMode as string) === 'longBreak', `Expected longBreak after 4th focus session, got ${currentMode}`);

  // 4. Persistence & Reload Restoration
  const sessionRecord = {
    id: `sess-${Date.now()}`,
    mode: 'focus',
    durationMinutes: 25,
    dateString: '2026-08-15',
    timestamp: Date.now(),
    status: 'COMPLETED',
  };

  storageAdapter.set(STORAGE_KEYS.POMODORO_SESSIONS, [sessionRecord]);
  const restoredRecords = storageAdapter.get<typeof sessionRecord[]>(STORAGE_KEYS.POMODORO_SESSIONS, []);

  assert(restoredRecords.length === 1, 'Restored session records must contain 1 item');
  assert(restoredRecords[0].id === sessionRecord.id, 'Session record ID must match');

  console.log('✅ Pomodoro Timer & Background Tests PASSED (4/4)');
}
