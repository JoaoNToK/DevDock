'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export interface SavePomodoroSessionInput {
  mode: string;
  configuredDuration: number; // in seconds
  actualDuration: number;     // in seconds
  status: 'COMPLETED' | 'SKIPPED' | 'RESET' | 'CANCELLED';
  startedAt: string;         // ISO String
  endedAt: string;           // ISO String
  projectId?: string | null;
  taskId?: string | null;
}

export async function savePomodoroSessionAction(input: SavePomodoroSessionInput) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { success: false, message: 'Usuário não autenticado' };
  }

  const userId = (session.user as { id: string }).id;

  try {
    const record = await prisma.pomodoroSession.create({
      data: {
        userId,
        mode: input.mode,
        duration: input.actualDuration,
        completedAt: new Date(input.endedAt),
      },
    });

    // Also update UserSettings total focus if completed
    if (input.status === 'COMPLETED' && input.mode === 'focus') {
      const minutesToIncrement = Math.floor(input.actualDuration / 60);
      if (minutesToIncrement > 0) {
        await prisma.userSettings.upsert({
          where: { userId },
          update: {},
          create: { userId },
        });
      }
    }

    return { success: true, recordId: record.id };
  } catch (error: any) {
    console.error('Error saving pomodoro session to PostgreSQL:', error);
    return { success: false, error: error.message };
  }
}
