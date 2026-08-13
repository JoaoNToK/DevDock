export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskCategory = 'estudos' | 'trabalho' | 'programacao' | 'pessoal' | 'geral';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;            // Details text under task title
  subtasks?: Subtask[];            // Nested subtasks array
  category: TaskCategory;
  priority: TaskPriority;
  tags: string[];                  // e.g. ["react", "exam"]
  estimatedPomodoros: number;      // e.g. 4
  completedPomodoros: number;      // e.g. 2
  isCompleted: boolean;
  isStarred?: boolean;             // Starred task support
  createdAt: number;               // Date.now()
  dateString: string;              // "YYYY-MM-DD"
}

export type TaskFilterStatus = 'all' | 'today' | 'starred' | 'pending' | 'completed';
