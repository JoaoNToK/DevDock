console.log('🧪 Running Phase 3 Google Calendar Tests...');

try {
  const gActions = require('../src/app/actions/googleCalendarActions');

  if (typeof gActions.syncEventToGoogleCalendarAction === 'function' &&
      typeof gActions.fetchGoogleCalendarEventsAction === 'function') {
    console.log('  ✓ Google Calendar Server Actions (syncEventToGoogleCalendarAction, fetchGoogleCalendarEventsAction) are compiled and exported.');
  } else {
    throw new Error('Google Calendar Server Actions missing or not exported correctly.');
  }

  console.log('✅ Phase 3 Google Calendar Integration Tests PASSED!');
} catch (error) {
  console.error('❌ Phase 3 Google Calendar Integration Tests FAILED:', error);
  process.exit(1);
}
