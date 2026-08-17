export type EventCategory =
  | 'Estudos'
  | 'Trabalho'
  | 'Pessoal'
  | 'Saúde'
  | 'Faculdade'
  | 'Prova'
  | 'Outros';

export type EventRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  dateString: string; // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  category: EventCategory;
  color?: string;
  recurrence?: EventRecurrence;
  recurrenceEndDate?: string; // YYYY-MM-DD
  createdAt: number;
}
