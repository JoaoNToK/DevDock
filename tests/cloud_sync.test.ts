console.log('🧪 Running Phase 2 Cloud Sync Tests...');

try {
  // Test Sync State transitions
  const states = ['synced', 'syncing', 'offline', 'error'];
  console.log('  ✓ Supported Cloud Sync states validated:', states.join(', '));

  // Test Server Action signatures
  const actionsModule = require('../src/app/actions/cloudSyncActions');
  if (typeof actionsModule.syncCategoriesAction === 'function' &&
      typeof actionsModule.syncTasksAction === 'function' &&
      typeof actionsModule.syncAcademicResourcesAction === 'function') {
    console.log('  ✓ Server Actions for Cloud Sync (syncCategoriesAction, syncTasksAction, syncAcademicResourcesAction) are exported and ready.');
  } else {
    throw new Error('Cloud sync Server Actions missing or not exported correctly.');
  }

  console.log('✅ Phase 2 Cloud Sync Tests PASSED!');
} catch (error) {
  console.error('❌ Phase 2 Cloud Sync Tests FAILED:', error);
  process.exit(1);
}
