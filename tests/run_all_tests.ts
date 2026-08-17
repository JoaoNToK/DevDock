import { runDateTimezoneTests } from './unit/date_timezone.test';
import { runPomodoroTests } from './unit/pomodoro.test';
import { runProjectsKanbanTests } from './unit/projects.test';
import { runCollegeCalendarIntegrationTests } from './integration/college_calendar_integration.test';

async function runAllTests() {
  console.log('====================================================');
  console.log('🚀 DEVDOCK AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  try {
    runDateTimezoneTests();
    console.log('----------------------------------------------------');
    runPomodoroTests();
    console.log('----------------------------------------------------');
    runProjectsKanbanTests();
    console.log('----------------------------------------------------');
    runCollegeCalendarIntegrationTests();
    console.log('----------------------------------------------------');
    console.log('🧪 Running Prisma & Database Schema Tests...');
    require('./prisma_schema_validation.test');
    console.log('====================================================');
    console.log('🎉 ALL TEST SUITES COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:');
    console.error(error.message || error);
    process.exit(1);
  }
}

runAllTests();
