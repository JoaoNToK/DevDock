'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export interface LocalStorageMigrationPayload {
  projects?: Array<{
    name: string;
    description?: string;
    category?: string;
    status?: string;
    color?: string;
    icon?: string;
    columns?: Array<{ name: string; color: string; order: number }>;
    tasks?: Array<{ title: string; description?: string; priority?: string; dueDate?: string; completed?: boolean; tags?: string[] }>;
    notes?: Array<{ title: string; content: string; tags?: string[] }>;
    goals?: Array<{ title: string; description?: string; targetDate?: string; completed?: boolean }>;
  }>;
  studies?: Array<{
    name: string;
    color: string;
    icon?: string;
    description?: string;
    topics?: Array<{ title: string; status?: string; priority?: string }>;
    sessions?: Array<{ duration: number; notes?: string; date?: string }>;
  }>;
  academic?: {
    courseName?: string;
    institution?: string;
    startYear?: number;
    endYear?: number;
    semesters?: Array<{
      number: number;
      year: number;
      period: string;
      isCurrent?: boolean;
      subjects?: Array<{
        name: string;
        code?: string;
        professor?: string;
        room?: string;
        schedule?: string;
        color?: string;
        assessments?: Array<{
          title: string;
          type: string;
          dueDate: string;
          weight?: number;
          grade?: number;
          completed?: boolean;
        }>;
      }>;
    }>;
  };
  events?: Array<{
    title: string;
    description?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    category?: string;
    color?: string;
    completed?: boolean;
  }>;
  activities?: Array<{
    title: string;
    dateString: string;
    time?: string;
    category?: string;
    completed?: boolean;
  }>;
}

export async function migrateLocalStorageToDatabaseAction(payload: LocalStorageMigrationPayload) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error('Não autorizado. Faça login para migrar seus dados.');
  }

  const userId = (session.user as { id: string }).id;

  return await prisma.$transaction(async (tx) => {
    let importedProjectsCount = 0;
    let importedStudiesCount = 0;
    let importedEventsCount = 0;

    // 1. Migrate Projects
    if (payload.projects && Array.isArray(payload.projects)) {
      for (const proj of payload.projects) {
        const createdProject = await tx.project.create({
          data: {
            userId,
            name: proj.name,
            description: proj.description,
            category: proj.category || 'Desenvolvimento',
            status: proj.status || 'em_andamento',
            color: proj.color || '#5379AE',
            icon: proj.icon || 'rocket_launch',
          },
        });

        importedProjectsCount++;

        // Migrate Columns & Tasks
        if (proj.columns && Array.isArray(proj.columns)) {
          for (const col of proj.columns) {
            const createdCol = await tx.projectColumn.create({
              data: {
                projectId: createdProject.id,
                name: col.name,
                color: col.color,
                order: col.order,
              },
            });

            // Add matching tasks to column
            if (proj.tasks && Array.isArray(proj.tasks)) {
              for (const t of proj.tasks) {
                await tx.projectTask.create({
                  data: {
                    projectId: createdProject.id,
                    columnId: createdCol.id,
                    title: t.title,
                    description: t.description,
                    priority: t.priority || 'media',
                    dueDate: t.dueDate ? new Date(t.dueDate) : null,
                    completed: t.completed || false,
                    tags: t.tags || [],
                  },
                });
              }
            }
          }
        }

        // Migrate Notes
        if (proj.notes && Array.isArray(proj.notes)) {
          for (const n of proj.notes) {
            await tx.projectNote.create({
              data: {
                projectId: createdProject.id,
                title: n.title,
                content: n.content,
                tags: n.tags || [],
              },
            });
          }
        }

        // Migrate Goals
        if (proj.goals && Array.isArray(proj.goals)) {
          for (const g of proj.goals) {
            await tx.projectGoal.create({
              data: {
                projectId: createdProject.id,
                title: g.title,
                description: g.description,
                targetDate: g.targetDate ? new Date(g.targetDate) : null,
                completed: g.completed || false,
              },
            });
          }
        }
      }
    }

    // 2. Migrate Studies
    if (payload.studies && Array.isArray(payload.studies)) {
      for (const st of payload.studies) {
        const createdSubject = await tx.studySubject.create({
          data: {
            userId,
            name: st.name,
            color: st.color || '#0474C4',
            icon: st.icon || 'menu_book',
            description: st.description,
          },
        });

        importedStudiesCount++;

        if (st.topics && Array.isArray(st.topics)) {
          for (const top of st.topics) {
            await tx.studyTopic.create({
              data: {
                subjectId: createdSubject.id,
                title: top.title,
                status: top.status || 'pendente',
                priority: top.priority || 'media',
              },
            });
          }
        }
      }
    }

    // 3. Migrate Calendar Events
    if (payload.events && Array.isArray(payload.events)) {
      for (const ev of payload.events) {
        await tx.calendarEvent.create({
          data: {
            userId,
            title: ev.title,
            description: ev.description,
            date: ev.date,
            startTime: ev.startTime,
            endTime: ev.endTime,
            category: ev.category || 'pessoal',
            color: ev.color || '#5379AE',
            completed: ev.completed || false,
          },
        });
        importedEventsCount++;
      }
    }

    // 4. Migrate Academic Data
    if (payload.academic && payload.academic.courseName) {
      const createdCourse = await tx.academicCourse.create({
        data: {
          userId,
          courseName: payload.academic.courseName,
          institution: payload.academic.institution,
          startYear: payload.academic.startYear || new Date().getFullYear(),
          endYear: payload.academic.endYear,
        },
      });

      if (payload.academic.semesters && Array.isArray(payload.academic.semesters)) {
        for (const sem of payload.academic.semesters) {
          const createdSem = await tx.academicSemester.create({
            data: {
              courseId: createdCourse.id,
              number: sem.number,
              year: sem.year,
              period: sem.period,
              isCurrent: sem.isCurrent || false,
            },
          });

          if (sem.subjects && Array.isArray(sem.subjects)) {
            for (const sub of sem.subjects) {
              const createdSub = await tx.academicSubject.create({
                data: {
                  semesterId: createdSem.id,
                  name: sub.name,
                  code: sub.code,
                  professor: sub.professor,
                  room: sub.room,
                  schedule: sub.schedule,
                  color: sub.color || '#0474C4',
                },
              });

              if (sub.assessments && Array.isArray(sub.assessments)) {
                for (const ass of sub.assessments) {
                  await tx.academicAssessment.create({
                    data: {
                      subjectId: createdSub.id,
                      title: ass.title,
                      type: ass.type || 'prova',
                      dueDate: new Date(ass.dueDate),
                      weight: ass.weight,
                      grade: ass.grade,
                      completed: ass.completed || false,
                    },
                  });
                }
              }
            }
          }
        }
      }
    }

    return {
      success: true,
      importedProjectsCount,
      importedStudiesCount,
      importedEventsCount,
    };
  });
}
