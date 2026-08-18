'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { Category } from '@/types/category';
import { Task } from '@/types/task';
import { AcademicLink, AcademicAttachmentFile } from '@/types/academic';
import { realtimeBroadcaster } from '@/lib/realtime/broadcaster';

export async function syncCategoriesAction(categories: Category[]) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, reason: 'unauthenticated' };
  const userId = (session.user as { id: string }).id;

  try {
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          isDefault: cat.isDefault,
          updatedAt: new Date(),
        },
        create: {
          id: cat.id,
          userId,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          isDefault: cat.isDefault,
        },
      });
    }
    return { success: true, count: categories.length };
  } catch (error) {
    console.error('syncCategoriesAction error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function syncTasksAction(tasks: Task[]) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, reason: 'unauthenticated' };
  const userId = (session.user as { id: string }).id;

  try {
    for (const task of tasks) {
      await prisma.pomodoroTask.upsert({
        where: { id: task.id },
        update: {
          title: task.title,
          description: task.description || null,
          subtasks: task.subtasks ? (task.subtasks as any) : null,
          category: task.category,
          priority: task.priority,
          tags: task.tags || [],
          estimatedPomodoros: task.estimatedPomodoros,
          completedPomodoros: task.completedPomodoros,
          completed: task.isCompleted,
          isStarred: task.isStarred || false,
          projectId: task.projectId || null,
          dateString: task.dateString,
          updatedAt: new Date(),
        },
        create: {
          id: task.id,
          userId,
          title: task.title,
          description: task.description || null,
          subtasks: task.subtasks ? (task.subtasks as any) : null,
          category: task.category,
          priority: task.priority,
          tags: task.tags || [],
          estimatedPomodoros: task.estimatedPomodoros,
          completedPomodoros: task.completedPomodoros,
          completed: task.isCompleted,
          isStarred: task.isStarred || false,
          projectId: task.projectId || null,
          dateString: task.dateString,
        },
      });
    }
    return { success: true, count: tasks.length };
  } catch (error) {
    console.error('syncTasksAction error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function syncAcademicResourcesAction(links: AcademicLink[], files: AcademicAttachmentFile[]) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, reason: 'unauthenticated' };
  const userId = (session.user as { id: string }).id;

  try {
    for (const link of links) {
      await prisma.academicLink.upsert({
        where: { id: link.id },
        update: {
          title: link.title,
          url: link.url,
          description: link.description || null,
          resourceType: link.resourceType || 'repo',
          deliveryName: link.deliveryName || null,
          updatedAt: new Date(),
        },
        create: {
          id: link.id,
          userId,
          title: link.title,
          url: link.url,
          description: link.description || null,
          resourceType: link.resourceType || 'repo',
          deliveryName: link.deliveryName || null,
        },
      });
    }

    for (const file of files) {
      await prisma.academicAttachmentFile.upsert({
        where: { id: file.id },
        update: {
          name: file.name,
          size: file.size,
          type: file.type,
          resourceType: file.resourceType || 'other',
          dataUrl: file.dataUrl || null,
          deliveryName: file.deliveryName || null,
        },
        create: {
          id: file.id,
          userId,
          name: file.name,
          size: file.size,
          type: file.type,
          resourceType: file.resourceType || 'other',
          dataUrl: file.dataUrl || null,
          deliveryName: file.deliveryName || null,
        },
      });
    }

    return { success: true, linkCount: links.length, fileCount: files.length };
  } catch (error) {
    console.error('syncAcademicResourcesAction error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function fetchUserCloudDataAction() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, reason: 'unauthenticated' };
  const userId = (session.user as { id: string }).id;

  try {
    const categories = await prisma.category.findMany({ where: { userId } });
    const tasks = await prisma.pomodoroTask.findMany({ where: { userId } });
    const links = await prisma.academicLink.findMany({ where: { userId } });
    const files = await prisma.academicAttachmentFile.findMany({ where: { userId } });

    return {
      success: true,
      data: {
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          isDefault: c.isDefault,
        })),
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description || undefined,
          subtasks: t.subtasks ? (t.subtasks as any) : [],
          category: t.category as any,
          priority: t.priority as any,
          tags: t.tags || [],
          estimatedPomodoros: t.estimatedPomodoros,
          completedPomodoros: t.completedPomodoros,
          isCompleted: t.completed,
          isStarred: t.isStarred,
          projectId: t.projectId || undefined,
          dateString: t.dateString,
          createdAt: t.createdAt.getTime(),
        })),
        links: links.map((l) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          description: l.description || undefined,
          resourceType: (l.resourceType as any) || 'repo',
          deliveryName: l.deliveryName || undefined,
        })),
        files: files.map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          resourceType: (f.resourceType as any) || 'other',
          dataUrl: f.dataUrl || undefined,
          deliveryName: f.deliveryName || undefined,
        })),
      },
    };
  } catch (error) {
    console.error('fetchUserCloudDataAction error:', error);
    return { success: false, error: (error as Error).message };
  }
}
