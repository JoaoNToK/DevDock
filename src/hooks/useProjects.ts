'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Project,
  KanbanColumn,
  ProjectTask,
  ProjectNote,
  ProjectDoc,
  ProjectGoal,
  ProjectResource,
  ProjectTimelineEvent,
  ProjectStatus,
  ProjectPriority,
  ChecklistItem,
  Subtask,
} from '@/types/projects';

const STORAGE_KEY = 'devdock_projects_data_v1';

interface ProjectsData {
  projects: Project[];
  columns: KanbanColumn[];
  tasks: ProjectTask[];
  notes: ProjectNote[];
  docs: ProjectDoc[];
  goals: ProjectGoal[];
  resources: ProjectResource[];
  timeline: ProjectTimelineEvent[];
}

export function useProjects() {
  const [data, setData] = useState<ProjectsData>({
    projects: [],
    columns: [],
    tasks: [],
    notes: [],
    docs: [],
    goals: [],
    resources: [],
    timeline: [],
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(JSON.parse(raw));
      } else {
        // Initial sample data
        const todayStr = new Date().toISOString().split('T')[0];
        const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

        const sampleProjects: Project[] = [
          {
            id: 'proj-fin',
            name: 'Sistema Financeiro',
            description: 'Sistema de gestão financeira e fluxo de caixa completo',
            status: 'active',
            priority: 'high',
            startDate: todayStr,
            dueDate: nextWeekStr,
            color: '#6366f1',
            icon: '🚀',
            totalFocusMinutes: 870, // 14.5 hours
            isArchived: false,
            createdAt: Date.now(),
          },
          {
            id: 'proj-port',
            name: 'Portfólio Pessoal',
            description: 'Redesenho do meu portfólio profissional em Next.js',
            status: 'planning',
            priority: 'medium',
            startDate: todayStr,
            dueDate: nextWeekStr,
            color: '#10b981',
            icon: '🎨',
            totalFocusMinutes: 300,
            isArchived: false,
            createdAt: Date.now(),
          },
        ];

        const sampleColumns: KanbanColumn[] = [
          { id: 'col-backlog', projectId: 'proj-fin', name: 'BACKLOG', order: 0, color: '#71717a' },
          { id: 'col-todo', projectId: 'proj-fin', name: 'A FAZER', order: 1, color: '#f59e0b' },
          { id: 'col-progress', projectId: 'proj-fin', name: 'EM ANDAMENTO', order: 2, color: '#6366f1' },
          { id: 'col-review', projectId: 'proj-fin', name: 'EM REVISÃO', order: 3, color: '#8b5cf6' },
          { id: 'col-done', projectId: 'proj-fin', name: 'CONCLUÍDO', order: 4, color: '#10b981' },
        ];

        const sampleTasks: ProjectTask[] = [
          {
            id: 'task-1',
            projectId: 'proj-fin',
            columnId: 'col-progress',
            title: 'Implementar autenticação JWT & OAuth',
            description: 'Criar rotas de login, cadastro com Google e renovação de token.',
            priority: 'high',
            dueDate: todayStr,
            tags: ['backend', 'auth'],
            checklist: [
              { id: 'c1', text: 'Desenhar esquema de tokens', isCompleted: true },
              { id: 'c2', text: 'Criar middleware de rotas privadas', isCompleted: true },
              { id: 'c3', text: 'Integrar botão de Google OAuth', isCompleted: false },
            ],
            subtasks: [
              { id: 'st1', title: 'Testar expiração de sessão', isCompleted: false },
            ],
            focusMinutes: 180,
            createdAt: Date.now(),
          },
          {
            id: 'task-2',
            projectId: 'proj-fin',
            columnId: 'col-todo',
            title: 'Criar Dashboard com Gráficos Recharts',
            description: 'Visualização interativa de receitas, despesas e saldo mensal.',
            priority: 'medium',
            dueDate: nextWeekStr,
            tags: ['frontend', 'charts'],
            checklist: [
              { id: 'c4', text: 'Montar cards de resumo', isCompleted: true },
              { id: 'c5', text: 'Configurar Recharts responsivo', isCompleted: false },
            ],
            subtasks: [],
            focusMinutes: 120,
            createdAt: Date.now(),
          },
          {
            id: 'task-3',
            projectId: 'proj-fin',
            columnId: 'col-done',
            title: 'Modelagem do Banco de Dados PostgreSQL',
            description: 'Criação de tabelas, índices e relacionamentos no Prisma.',
            priority: 'high',
            dueDate: todayStr,
            tags: ['database'],
            checklist: [],
            subtasks: [],
            focusMinutes: 240,
            createdAt: Date.now(),
            completedAt: Date.now(),
          },
        ];

        const sampleNotes: ProjectNote[] = [
          {
            id: 'note-p1',
            projectId: 'proj-fin',
            title: 'Decisão de Arquitetura de Tokens',
            content: 'Utilizaremos Refresh Tokens armazenados em HTTPOnly Cookies para segurança contra ataques XSS.',
            tags: ['auth', 'backend'],
            isPinned: true,
            isArchived: false,
            createdAt: Date.now(),
          },
        ];

        const sampleDocs: ProjectDoc[] = [
          {
            id: 'doc-p1',
            projectId: 'proj-fin',
            title: 'Documentação Técnica & Arquitetura',
            content: '# Sistema Financeiro\n\n## Tecnologias\n- Next.js 15\n- Tailwind CSS\n- TypeScript\n- PostgreSQL & Prisma\n\n## Objetivos\nEntregar um sistema com gráficos interativos e controle de categorias.',
            updatedAt: Date.now(),
          },
        ];

        const sampleGoals: ProjectGoal[] = [
          {
            id: 'goal-p1',
            projectId: 'proj-fin',
            title: 'Lançar MVP Funcional',
            description: 'Concluir módulo de login, lançamentos e relatórios.',
            targetDate: nextWeekStr,
            status: 'in_progress',
            progressPct: 65,
          },
        ];

        const sampleResources: ProjectResource[] = [
          {
            id: 'res-p1',
            projectId: 'proj-fin',
            category: 'repo',
            name: 'Repositório GitHub',
            url: 'https://github.com/JoaoNToK/DevDock.git',
            description: 'Código fonte principal do projeto',
            createdAt: Date.now(),
          },
        ];

        const sampleTimeline: ProjectTimelineEvent[] = [
          {
            id: 'time-1',
            projectId: 'proj-fin',
            title: '🚀 Projeto Sistema Financeiro criado',
            date: todayStr,
            type: 'created',
          },
        ];

        const initialData: ProjectsData = {
          projects: sampleProjects,
          columns: sampleColumns,
          tasks: sampleTasks,
          notes: sampleNotes,
          docs: sampleDocs,
          goals: sampleGoals,
          resources: sampleResources,
          timeline: sampleTimeline,
        };

        setData(initialData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (e) {
      console.error('Error loading projects data:', e);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isMounted]);

  // Project Progress Calculation Helper
  const getProjectProgress = useCallback(
    (projectId: string) => {
      const projTasks = data.tasks.filter((t) => t.projectId === projectId);
      if (projTasks.length === 0) return 0;
      const completed = projTasks.filter((t) => {
        const doneCol = data.columns.find((c) => c.id === t.columnId && c.name.toUpperCase() === 'CONCLUÍDO');
        return doneCol || t.completedAt;
      }).length;
      return Math.round((completed / projTasks.length) * 100);
    },
    [data.tasks, data.columns]
  );

  // Projects CRUD
  const addProject = (proj: Omit<Project, 'id' | 'totalFocusMinutes' | 'isArchived' | 'createdAt'>) => {
    const newProj: Project = {
      ...proj,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      totalFocusMinutes: 0,
      isArchived: false,
      createdAt: Date.now(),
    };

    // Default 5 columns for new project
    const defaultCols: KanbanColumn[] = [
      { id: `col-${newProj.id}-1`, projectId: newProj.id, name: 'BACKLOG', order: 0, color: '#71717a' },
      { id: `col-${newProj.id}-2`, projectId: newProj.id, name: 'A FAZER', order: 1, color: '#f59e0b' },
      { id: `col-${newProj.id}-3`, projectId: newProj.id, name: 'EM ANDAMENTO', order: 2, color: '#6366f1' },
      { id: `col-${newProj.id}-4`, projectId: newProj.id, name: 'EM REVISÃO', order: 3, color: '#8b5cf6' },
      { id: `col-${newProj.id}-5`, projectId: newProj.id, name: 'CONCLUÍDO', order: 4, color: '#10b981' },
    ];

    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
      columns: [...prev.columns, ...defaultCols],
    }));

    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const toggleArchiveProject = (id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, isArchived: !p.isArchived } : p)),
    }));
  };

  const deleteProject = (id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      columns: prev.columns.filter((c) => c.projectId !== id),
      tasks: prev.tasks.filter((t) => t.projectId !== id),
      notes: prev.notes.filter((n) => n.projectId !== id),
      docs: prev.docs.filter((d) => d.projectId !== id),
      goals: prev.goals.filter((g) => g.projectId !== id),
      resources: prev.resources.filter((r) => r.projectId !== id),
      timeline: prev.timeline.filter((tm) => tm.projectId !== id),
    }));
  };

  // Kanban Columns CRUD
  const addColumn = (projectId: string, name: string) => {
    const projCols = data.columns.filter((c) => c.projectId === projectId);
    const newCol: KanbanColumn = {
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      name: name.toUpperCase(),
      order: projCols.length,
      color: '#6366f1',
    };
    setData((prev) => ({ ...prev, columns: [...prev.columns, newCol] }));
    return newCol;
  };

  const updateColumn = (id: string, name: string) => {
    setData((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.id === id ? { ...c, name: name.toUpperCase() } : c)),
    }));
  };

  const deleteColumn = (id: string) => {
    setData((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== id),
      tasks: prev.tasks.filter((t) => t.columnId !== id),
    }));
  };

  // Tasks CRUD
  const addTask = (task: Omit<ProjectTask, 'id' | 'focusMinutes' | 'createdAt'>) => {
    const newTask: ProjectTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      focusMinutes: 0,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<ProjectTask>) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const moveTaskColumn = (taskId: string, targetColumnId: string) => {
    setData((prev) => {
      const targetCol = prev.columns.find((c) => c.id === targetColumnId);
      const isDone = targetCol && targetCol.name.toUpperCase() === 'CONCLUÍDO';

      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                columnId: targetColumnId,
                completedAt: isDone ? Date.now() : undefined,
              }
            : t
        ),
      };
    });
  };

  const toggleTaskChecklist = (taskId: string, itemId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map((i) =>
          i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
        );
        return { ...t, checklist: updatedChecklist };
      }),
    }));
  };

  const toggleTaskSubtask = (taskId: string, subtaskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
        );
        return { ...t, subtasks: updatedSubtasks };
      }),
    }));
  };

  const deleteTask = (id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  // Notes CRUD & Quick Note to Task Conversion
  const addNote = (note: Omit<ProjectNote, 'id' | 'createdAt'>) => {
    const newNote: ProjectNote = {
      ...note,
      id: `pnote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, notes: [...prev.notes, newNote] }));
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<ProjectNote>) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  };

  const togglePinNote = (id: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    }));
  };

  const toggleArchiveNote = (id: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, isArchived: !n.isArchived } : n)),
    }));
  };

  const deleteNote = (id: string) => {
    setData((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
  };

  const convertNoteToTask = (noteId: string, columnId: string) => {
    const note = data.notes.find((n) => n.id === noteId);
    if (!note) return;

    addTask({
      projectId: note.projectId,
      columnId,
      title: note.title,
      description: note.content,
      priority: 'medium',
      tags: note.tags,
      checklist: [],
      subtasks: [],
    });
  };

  // Documentation
  const updateDoc = (projectId: string, content: string, title: string = 'Documentação Técnica') => {
    setData((prev) => {
      const existing = prev.docs.find((d) => d.projectId === projectId);
      if (existing) {
        return {
          ...prev,
          docs: prev.docs.map((d) =>
            d.projectId === projectId ? { ...d, content, title, updatedAt: Date.now() } : d
          ),
        };
      }
      const newDoc: ProjectDoc = {
        id: `pdoc-${Date.now()}`,
        projectId,
        title,
        content,
        updatedAt: Date.now(),
      };
      return { ...prev, docs: [...prev.docs, newDoc] };
    });
  };

  // Goals
  const addGoal = (goal: Omit<ProjectGoal, 'id'>) => {
    const newGoal: ProjectGoal = {
      ...goal,
      id: `pgoal-${Date.now()}`,
    };
    setData((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }));
    return newGoal;
  };

  const deleteGoal = (id: string) => {
    setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  };

  // Resources
  const addResource = (res: Omit<ProjectResource, 'id' | 'createdAt'>) => {
    const newRes: ProjectResource = {
      ...res,
      id: `pres-${Date.now()}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, resources: [...prev.resources, newRes] }));
    return newRes;
  };

  const deleteResource = (id: string) => {
    setData((prev) => ({ ...prev, resources: prev.resources.filter((r) => r.id !== id) }));
  };

  // Timer focus time recording for project & task
  const recordTaskFocusTime = (projectId: string, taskId?: string, minutes: number = 25) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, totalFocusMinutes: p.totalFocusMinutes + minutes } : p
      ),
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, focusMinutes: t.focusMinutes + minutes } : t
      ),
    }));
  };

  return {
    isMounted,
    projects: data.projects,
    columns: data.columns,
    tasks: data.tasks,
    notes: data.notes,
    docs: data.docs,
    goals: data.goals,
    resources: data.resources,
    timeline: data.timeline,
    getProjectProgress,
    addProject,
    updateProject,
    toggleArchiveProject,
    deleteProject,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    updateTask,
    moveTaskColumn,
    toggleTaskChecklist,
    toggleTaskSubtask,
    deleteTask,
    addNote,
    updateNote,
    togglePinNote,
    toggleArchiveNote,
    deleteNote,
    convertNoteToTask,
    updateDoc,
    addGoal,
    deleteGoal,
    addResource,
    deleteResource,
    recordTaskFocusTime,
  };
}
