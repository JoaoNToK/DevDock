import { PrismaClient } from '@prisma/client';

console.log('🧪 Running Prisma Schema & V2 Entity Validation Tests...');

try {
  // Test Prisma Client instantiation
  const prisma = new PrismaClient();
  console.log('  ✓ Prisma Client instantiated successfully.');

  // Validate Prisma Client Model definitions exist
  if (typeof prisma.user !== 'undefined' &&
      typeof prisma.category !== 'undefined' &&
      typeof prisma.project !== 'undefined' &&
      typeof prisma.projectTask !== 'undefined' &&
      typeof prisma.projectNote !== 'undefined' &&
      typeof prisma.academicLink !== 'undefined' &&
      typeof prisma.academicAttachmentFile !== 'undefined' &&
      typeof prisma.pomodoroTask !== 'undefined') {
    console.log('  ✓ All V2 Prisma Models (User, Category, Project, ProjectTask, ProjectNote, AcademicLink, AcademicAttachmentFile, PomodoroTask) are compiled and exported!');
  } else {
    throw new Error('Some V2 models are missing from Prisma Client.');
  }

  console.log('✅ Prisma Schema Validation Tests PASSED!');
  process.exit(0);
} catch (error) {
  console.error('❌ Prisma Schema Validation Tests FAILED:', error);
  process.exit(1);
}
