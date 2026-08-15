export type AcademicEventType =
  | 'prova'
  | 'trabalho'
  | 'atividade'
  | 'apresentacao'
  | 'tde'
  | 'projeto'
  | 'seminario'
  | 'outro';

export type AssignmentStatus =
  | 'not_started'
  | 'in_progress'
  | 'review'
  | 'submitted'
  | 'overdue';

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface AcademicCourse {
  name: string;
  institution: string;
  currentSemesterName: string; // e.g. "3º semestre"
  currentPeriod: string;       // e.g. "2026.2"
  year: number;
}

export interface AcademicSemester {
  id: string;
  name: string;      // e.g. "2026.2 - 3º Semestre"
  period: string;    // e.g. "2026.2"
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isCurrent: boolean;
}

export interface AcademicSubject {
  id: string;
  semesterId: string;
  name: string;        // e.g. "Banco de Dados"
  code?: string;       // e.g. "BD-301"
  professor?: string;  // e.g. "Prof. João Silva"
  classroom?: string;  // e.g. "Sala 12"
  classDay?: string;   // e.g. "Segunda-feira"
  classTime?: string;  // e.g. "19:00 - 20:40"
  workloadHours: number; // e.g. 80
  color: string;
  gradeP1?: number;
  gradeP2?: number;
  attendancePct?: number;
  createdAt: number;
}

export interface AcademicAssignment {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  type: AcademicEventType;
  dueDate: string;    // YYYY-MM-DD
  dueTime?: string;   // HH:MM
  location?: string;  // e.g. "Sala 12" or "Portal AVA"
  weight?: number;    // e.g. 2.0 or 10.0
  priority: 'low' | 'medium' | 'high';
  status: AssignmentStatus;
  checklist: ChecklistItem[];
  createdAt: number;
}

export interface AcademicData {
  course: AcademicCourse;
  semesters: AcademicSemester[];
  subjects: AcademicSubject[];
  assignments: AcademicAssignment[];
}
