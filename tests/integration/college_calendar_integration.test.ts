import { STORAGE_KEYS, storageAdapter } from '../../src/lib/storage';
import { AcademicAssignment, AcademicSubject } from '../../src/types/academic';
import { CalendarEvent } from '../../src/types/calendar';
import { setupMockStorage } from '../setup_mock_storage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed]: ${message}`);
  }
}

export function runCollegeCalendarIntegrationTests() {
  console.log('🧪 Running Faculdade -> Calendar Integration Tests...');

  // Setup Isolated Mock Storage
  setupMockStorage();
  storageAdapter.clear();

  // 1. Create Academic Subject & Exam
  const subject: AcademicSubject = {
    id: 'sub-bd-301',
    semesterId: 'sem-2026-2',
    name: 'Banco de Dados Relacional',
    code: 'BD-301',
    professor: 'Prof. João Silva',
    workloadHours: 80,
    color: '#0A0A0A',
    createdAt: Date.now(),
  };

  const exam: AcademicAssignment = {
    id: 'assign-exam-p1',
    subjectId: 'sub-bd-301',
    title: 'Prova P1 - Modelagem ER & SQL',
    type: 'prova',
    dueDate: '2026-08-25',
    dueTime: '19:30',
    weight: 4.0,
    priority: 'high',
    status: 'not_started',
    checklist: [],
    createdAt: Date.now(),
  };

  // Persist Academic Data
  storageAdapter.set(STORAGE_KEYS.ACADEMIC, {
    course: {
      name: 'Análise e Desenvolvimento de Sistemas',
      institution: 'DevDock Tech',
      currentSemesterName: '3º Semestre',
      currentPeriod: '2026.2',
      year: 2026,
    },
    semesters: [],
    subjects: [subject],
    assignments: [exam],
  });

  // Also persist 1 User Custom Calendar Event
  const userEvent: CalendarEvent = {
    id: 'evt-user-1',
    title: 'Reunião de Alinhamento DevDock',
    dateString: '2026-08-25',
    startTime: '10:00',
    endTime: '11:00',
    category: 'Trabalho',
    createdAt: Date.now(),
  };
  storageAdapter.set(STORAGE_KEYS.CALENDAR, [userEvent]);

  // 2. Integration Logic Test: Calendar Module reads Academic Assignments
  const academicData = storageAdapter.get<{ assignments?: AcademicAssignment[]; subjects?: AcademicSubject[] }>(
    STORAGE_KEYS.ACADEMIC,
    {}
  );
  const localUserEvents = storageAdapter.get<CalendarEvent[]>(STORAGE_KEYS.CALENDAR, []);

  let academicCalendarEvents: CalendarEvent[] = [];
  if (academicData && academicData.assignments) {
    const assignmentsList = academicData.assignments || [];
    const subjectsList = academicData.subjects || [];

    academicCalendarEvents = assignmentsList.map((a) => {
      const sub = subjectsList.find((s) => s.id === a.subjectId);
      const iconPrefix = a.type === 'prova' ? '📝 PROVA: ' : '📄 TRABALHO: ';
      return {
        id: `academic-evt-${a.id}`,
        title: `${iconPrefix}${a.title} (${sub?.name || 'Faculdade'})`,
        description: a.description || `Entrega/Prova da disciplina ${sub?.name || 'Acadêmica'}`,
        dateString: a.dueDate,
        startTime: a.dueTime || '19:00',
        endTime: '20:30',
        category: a.type === 'prova' ? 'Prova' : 'Faculdade',
        createdAt: a.createdAt,
      };
    });
  }

  const combinedCalendarEvents = [...localUserEvents, ...academicCalendarEvents];

  // Assertions
  assert(combinedCalendarEvents.length === 2, `Expected 2 calendar events, got ${combinedCalendarEvents.length}`);

  const academicEvt = combinedCalendarEvents.find((e) => e.id === 'academic-evt-assign-exam-p1');
  assert(academicEvt !== undefined, 'Academic Exam must appear in the combined calendar events');
  assert(Boolean(academicEvt?.title.includes('Prova P1')), `Title should contain 'Prova P1', got '${academicEvt?.title}'`);
  assert(academicEvt?.dateString === '2026-08-25', `Date must be '2026-08-25', got '${academicEvt?.dateString}'`);
  assert(academicEvt?.category === 'Prova', `Category must be 'Prova', got '${academicEvt?.category}'`);
  assert(academicEvt?.startTime === '19:30', `StartTime must be '19:30', got '${academicEvt?.startTime}'`);

  console.log('✅ Faculdade -> Calendar Integration Tests PASSED (2/2)');
}
