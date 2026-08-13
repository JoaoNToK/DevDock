export type EventCategory =
  | 'Estudos'
  | 'Trabalho'
  | 'Pessoal'
  | 'Saúde'
  | 'Faculdade'
  | 'Prova'
  | 'Outros';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  dateString: string; // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  category: EventCategory;
  color?: string;
  createdAt: number;
}
