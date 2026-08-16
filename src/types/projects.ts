export type ProjectStatus = 'active' | 'paused' | 'planning' | 'completed' | 'cancelled';
export type ProjectPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string; // YYYY-MM-DD
  dueDate?: string;   // YYYY-MM-DD
  color: string;
  icon?: string;
  totalFocusMinutes: number;
  isArchived: boolean;
  createdAt: number;
  updatedAt?: number;
  userId?: string;
}

export interface KanbanColumn {
  id: string;
  projectId: string;
  name: string;
  order: number;
  color?: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description?: string;
  priority: ProjectPriority;
  dueDate?: string; // YYYY-MM-DD
  tags: string[];
  checklist: ChecklistItem[];
  subtasks: Subtask[];
  focusMinutes: number;
  order?: number;
  createdAt: number;
  completedAt?: number;
  updatedAt?: number;
  userId?: string;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  taskId?: string;
  createdAt: number;
  updatedAt?: number;
  userId?: string;
}

export interface ProjectDoc {
  id: string;
  projectId: string;
  title: string;
  content: string; // Markdown / Text
  updatedAt: number;
}

export interface ProjectGoal {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progressPct: number;
}

export interface ProjectResource {
  id: string;
  projectId: string;
  category: 'document' | 'link' | 'design' | 'pdf' | 'repo';
  name: string;
  url: string;
  description?: string;
  createdAt: number;
}

export interface ProjectTimelineEvent {
  id: string;
  projectId: string;
  title: string;
  date: string;
  type: 'created' | 'task_done' | 'milestone' | 'doc_updated';
}

export interface ProjectsData {
  projects: Project[];
  columns: KanbanColumn[];
  tasks: ProjectTask[];
  notes: ProjectNote[];
  docs: ProjectDoc[];
  goals: ProjectGoal[];
  resources: ProjectResource[];
  timeline: ProjectTimelineEvent[];
}
