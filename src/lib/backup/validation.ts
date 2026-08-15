import { DevDockBackupFile, BackupValidationResult } from './types';
import { SessionRecord } from '@/types/analytics';
import { Task } from '@/types/task';

/**
 * Validates an imported JSON string or parsed object against DevDock backup specifications.
 * Ensures data integrity and prevents corrupted files from restoring broken state.
 */
export function validateBackupFile(rawJsonStr: string): { result: BackupValidationResult; parsed?: DevDockBackupFile } {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJsonStr);
  } catch (e: unknown) {
    return {
      result: {
        isValid: false,
        version: 0,
        errors: ['O arquivo selecionado não é um JSON válido. Arquivo corrompido ou formato incorreto.'],
        warnings: [],
      },
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      result: {
        isValid: false,
        version: 0,
        errors: ['O arquivo de backup está vazio ou possui estrutura inválida.'],
        warnings: [],
      },
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Handle Legacy Backup format (Pomodoro cloud sync JSON)
  if (!obj.format && obj.settings && (obj.sessionRecords || obj.tasks)) {
    warnings.push('Formato de backup antigo (v0) detectado. O sistema realizará a migração automática para a v1.');
    const legacyParsed: DevDockBackupFile = {
      format: 'DevDock Backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      metadata: {
        format: 'DevDock Backup',
        version: 1,
        exportedAt: new Date().toISOString(),
        appName: 'DevDock Platform',
        counts: {
          projects: 0,
          tasks: Array.isArray(obj.tasks) ? obj.tasks.length : 0,
          calendarEvents: 0,
          plannerActivities: 0,
          subjects: 0,
          academicAssignments: 0,
          notes: 0,
          pomodoroRecords: Array.isArray(obj.sessionRecords) ? obj.sessionRecords.length : 0,
          goals: 0,
        },
      },
      data: {
        settings: {
          pomodoro: {
            focus: (obj.settings as Record<string, number>)?.focus || 25,
            shortBreak: (obj.settings as Record<string, number>)?.shortBreak || 5,
            longBreak: (obj.settings as Record<string, number>)?.longBreak || 15,
            volume: Number(obj.volume) || 0.8,
            dailyGoal: Number(obj.dailyGoal) || 8,
          },
        },
        pomodoro: {
          totalFocusMinutes: Number(obj.totalFocusMinutes) || 0,
          completedSessions: Number(obj.completedSessions) || 0,
          dailyGoal: Number(obj.dailyGoal) || 8,
          volume: Number(obj.volume) || 0.8,
          sessionRecords: Array.isArray(obj.sessionRecords) ? (obj.sessionRecords as SessionRecord[]) : [],
          tasks: Array.isArray(obj.tasks) ? (obj.tasks as Task[]) : [],
        },
        calendarEvents: [],
        plannerActivities: [],
        studiesData: { subjects: [], topics: [], notes: [], goals: [], resources: [] },
        academicData: { course: { name: '', institution: '', currentSemesterName: '', currentPeriod: '', year: new Date().getFullYear() }, semesters: [], subjects: [], assignments: [] },
        projectsData: { projects: [], columns: [], tasks: [], notes: [], docs: [], goals: [], resources: [], timeline: [] },
      },
    };

    return {
      result: {
        isValid: true,
        version: 1,
        exportedAt: legacyParsed.exportedAt,
        summary: legacyParsed.metadata.counts,
        errors: [],
        warnings,
      },
      parsed: legacyParsed,
    };
  }

  // Standard v1 format validation
  if (obj.format !== 'DevDock Backup') {
    errors.push('Formato de backup incompatível. Assinatura "DevDock Backup" não encontrada.');
  }

  if (typeof obj.version !== 'number' || obj.version > 1) {
    errors.push(`Versão do backup (${String(obj.version || 'desconhecida')}) não é suportada por esta versão do DevDock.`);
  }

  if (!obj.data || typeof obj.data !== 'object') {
    errors.push('O contêiner de dados ("data") do backup está ausente ou corrompido.');
  }

  if (errors.length > 0) {
    return {
      result: {
        isValid: false,
        version: (obj.version as number) || 0,
        errors,
        warnings,
      },
    };
  }

  const d = obj.data as Record<string, unknown>;
  const projData = d.projectsData as Record<string, unknown> | undefined;
  const pomData = d.pomodoro as Record<string, unknown> | undefined;
  const studData = d.studiesData as Record<string, unknown> | undefined;
  const acadData = d.academicData as Record<string, unknown> | undefined;

  // Extract counts for user confirmation summary
  const counts = {
    projects: Array.isArray(projData?.projects) ? projData.projects.length : 0,
    tasks: (Array.isArray(projData?.tasks) ? projData.tasks.length : 0) + (Array.isArray(pomData?.tasks) ? pomData.tasks.length : 0),
    calendarEvents: Array.isArray(d.calendarEvents) ? d.calendarEvents.length : 0,
    plannerActivities: Array.isArray(d.plannerActivities) ? d.plannerActivities.length : 0,
    subjects: (Array.isArray(studData?.subjects) ? studData.subjects.length : 0) + (Array.isArray(acadData?.subjects) ? acadData.subjects.length : 0),
    academicAssignments: Array.isArray(acadData?.assignments) ? acadData.assignments.length : 0,
    notes: (Array.isArray(studData?.notes) ? studData.notes.length : 0) + (Array.isArray(projData?.notes) ? projData.notes.length : 0),
    pomodoroRecords: Array.isArray(pomData?.sessionRecords) ? pomData.sessionRecords.length : 0,
    goals: (Array.isArray(studData?.goals) ? studData.goals.length : 0) + (Array.isArray(projData?.goals) ? projData.goals.length : 0),
  };

  return {
    result: {
      isValid: true,
      version: obj.version as number,
      exportedAt: obj.exportedAt as string | undefined,
      summary: counts,
      errors: [],
      warnings,
    },
    parsed: obj as unknown as DevDockBackupFile,
  };
}
