import { DevDockBackupFile, BackupValidationResult } from './types';

/**
 * Validates an imported JSON string or parsed object against DevDock backup specifications.
 * Ensures data integrity and prevents corrupted files from restoring broken state.
 */
export function validateBackupFile(rawJsonStr: string): { result: BackupValidationResult; parsed?: DevDockBackupFile } {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: any;
  try {
    parsed = JSON.parse(rawJsonStr);
  } catch (e: any) {
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

  // Handle Legacy Backup format (Pomodoro cloud sync JSON)
  if (!parsed.format && parsed.settings && (parsed.sessionRecords || parsed.tasks)) {
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
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks.length : 0,
          calendarEvents: 0,
          plannerActivities: 0,
          subjects: 0,
          academicAssignments: 0,
          notes: 0,
          pomodoroRecords: Array.isArray(parsed.sessionRecords) ? parsed.sessionRecords.length : 0,
          goals: 0,
        },
      },
      data: {
        settings: {
          pomodoro: {
            focus: parsed.settings?.focus || 25,
            shortBreak: parsed.settings?.shortBreak || 5,
            longBreak: parsed.settings?.longBreak || 15,
            volume: parsed.volume || 0.8,
            dailyGoal: parsed.dailyGoal || 8,
          },
        },
        pomodoro: {
          totalFocusMinutes: Number(parsed.totalFocusMinutes) || 0,
          completedSessions: Number(parsed.completedSessions) || 0,
          dailyGoal: Number(parsed.dailyGoal) || 8,
          volume: Number(parsed.volume) || 0.8,
          sessionRecords: Array.isArray(parsed.sessionRecords) ? parsed.sessionRecords : [],
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        },
        calendarEvents: [],
        plannerActivities: [],
        studiesData: { subjects: [], topics: [], notes: [], revisions: [], goals: [] },
        academicData: { course: { name: '' }, semesters: [], subjects: [], assignments: [] },
        projectsData: { projects: [], columns: [], tasks: [], notes: [], docs: [], goals: [], timelines: [], files: [], reports: [] },
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
  if (parsed.format !== 'DevDock Backup') {
    errors.push('Formato de backup incompatível. Assinatura "DevDock Backup" não encontrada.');
  }

  if (typeof parsed.version !== 'number' || parsed.version > 1) {
    errors.push(`Versão do backup (${parsed.version || 'desconhecida'}) não é suportada por esta versão do DevDock.`);
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    errors.push('O contêiner de dados ("data") do backup está ausente ou corrompido.');
  }

  if (errors.length > 0) {
    return {
      result: {
        isValid: false,
        version: parsed.version || 0,
        errors,
        warnings,
      },
    };
  }

  const d = parsed.data;

  // Extract counts for user confirmation summary
  const counts = {
    projects: Array.isArray(d.projectsData?.projects) ? d.projectsData.projects.length : 0,
    tasks: (Array.isArray(d.projectsData?.tasks) ? d.projectsData.tasks.length : 0) + (Array.isArray(d.pomodoro?.tasks) ? d.pomodoro.tasks.length : 0),
    calendarEvents: Array.isArray(d.calendarEvents) ? d.calendarEvents.length : 0,
    plannerActivities: Array.isArray(d.plannerActivities) ? d.plannerActivities.length : 0,
    subjects: (Array.isArray(d.studiesData?.subjects) ? d.studiesData.subjects.length : 0) + (Array.isArray(d.academicData?.subjects) ? d.academicData.subjects.length : 0),
    academicAssignments: Array.isArray(d.academicData?.assignments) ? d.academicData.assignments.length : 0,
    notes: (Array.isArray(d.studiesData?.notes) ? d.studiesData.notes.length : 0) + (Array.isArray(d.projectsData?.notes) ? d.projectsData.notes.length : 0),
    pomodoroRecords: Array.isArray(d.pomodoro?.sessionRecords) ? d.pomodoro.sessionRecords.length : 0,
    goals: (Array.isArray(d.studiesData?.goals) ? d.studiesData.goals.length : 0) + (Array.isArray(d.projectsData?.goals) ? d.projectsData.goals.length : 0),
  };

  return {
    result: {
      isValid: true,
      version: parsed.version,
      exportedAt: parsed.exportedAt,
      summary: counts,
      errors: [],
      warnings,
    },
    parsed: parsed as DevDockBackupFile,
  };
}
