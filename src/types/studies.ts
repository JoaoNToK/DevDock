export type TopicStatus = 'not_started' | 'in_progress' | 'completed';
export type TopicPriority = 'low' | 'medium' | 'high';

export interface Subject {
  id: string;
  name: string;
  description?: string;
  color: string; // e.g. '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'
  icon?: string;
  monthlyHoursGoal: number;
  totalTimeMinutes: number;
  createdAt: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  status: TopicStatus;
  priority: TopicPriority;
  targetDate?: string; // YYYY-MM-DD
  totalTimeMinutes: number;
  reviewIntervalDays?: number; // e.g. 1, 3, 7, 14
  nextReviewDate?: string;     // YYYY-MM-DD
  createdAt: number;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  topicId?: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface StudyGoal {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  targetValue: number;  // e.g. 20 (hours), 15 (topics)
  currentValue: number;
  type: 'hours' | 'topics' | 'sessions';
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  createdAt: number;
}

export interface StudyResource {
  id: string;
  subjectId: string;
  topicId?: string;
  name: string;
  url: string;
  description?: string;
  createdAt: number;
}
