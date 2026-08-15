import { STORAGE_KEYS, storageAdapter } from '../../src/lib/storage';
import { Project, ProjectTask, KanbanColumn } from '../../src/types/projects';
import { setupMockStorage } from '../setup_mock_storage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed]: ${message}`);
  }
}

export function runProjectsKanbanTests() {
  console.log('🧪 Running Projects, Kanban & Tasks Tests...');

  // Setup Isolated Mock Storage
  setupMockStorage();
  storageAdapter.clear();

  // 1. Create Project
  const newProject: Project = {
    id: 'proj-test-1',
    name: 'DevDock Redesign',
    description: 'Sistema de Notificações e Kanban',
    color: '#0A0A0A',
    icon: '🚀',
    status: 'active',
    priority: 'high',
    totalFocusMinutes: 120,
    isArchived: false,
    createdAt: Date.now(),
  };

  const initialColumns: KanbanColumn[] = [
    { id: 'col-todo', projectId: 'proj-test-1', name: 'A Fazer', order: 0 },
    { id: 'col-doing', projectId: 'proj-test-1', name: 'Em Andamento', order: 1 },
    { id: 'col-done', projectId: 'proj-test-1', name: 'Concluído', order: 2 },
  ];

  const taskA: ProjectTask = {
    id: 'task-a',
    projectId: 'proj-test-1',
    columnId: 'col-todo',
    title: 'Desenvolver Web Push',
    description: 'Service Worker & VAPID Keys',
    priority: 'high',
    dueDate: '2026-08-20',
    tags: ['pwa', 'push'],
    checklist: [],
    subtasks: [],
    focusMinutes: 0,
    order: 0,
    createdAt: Date.now(),
  };

  const taskB: ProjectTask = {
    id: 'task-b',
    projectId: 'proj-test-1',
    columnId: 'col-todo',
    title: 'Audit TypeScript',
    priority: 'urgent',
    tags: [],
    checklist: [],
    subtasks: [],
    focusMinutes: 0,
    order: 1,
    createdAt: Date.now(),
  };

  // Save to storage
  storageAdapter.set(STORAGE_KEYS.PROJECTS, {
    projects: [newProject],
    columns: initialColumns,
    tasks: [taskA, taskB],
  });

  // Verify persistence
  const savedData = storageAdapter.get<{ projects: Project[]; columns: KanbanColumn[]; tasks: ProjectTask[] }>(
    STORAGE_KEYS.PROJECTS,
    { projects: [], columns: [], tasks: [] }
  );

  assert(savedData.projects.length === 1, 'Should persist 1 project');
  assert(savedData.tasks.length === 2, 'Should persist 2 tasks');

  // 2. Task Column Movement (Drag & Drop Simulation)
  // Move Task A from 'A Fazer' (col-todo) to 'Em Andamento' (col-doing)
  const updatedTasks = savedData.tasks.map((t) => (t.id === 'task-a' ? { ...t, columnId: 'col-doing' } : t));

  storageAdapter.set(STORAGE_KEYS.PROJECTS, {
    ...savedData,
    tasks: updatedTasks,
  });

  const afterMoveData = storageAdapter.get<{ tasks: ProjectTask[] }>(STORAGE_KEYS.PROJECTS, { tasks: [] });
  const movedTask = afterMoveData.tasks.find((t) => t.id === 'task-a');

  assert(movedTask?.columnId === 'col-doing', `Task A columnId should be 'col-doing', got '${movedTask?.columnId}'`);

  // 3. Task Reordering (Positioning C at index 0)
  const taskC: ProjectTask = {
    id: 'task-c',
    projectId: 'proj-test-1',
    columnId: 'col-todo',
    title: 'Configurar Tailwind Theme',
    priority: 'high',
    tags: [],
    checklist: [],
    subtasks: [],
    focusMinutes: 0,
    order: 2,
    createdAt: Date.now(),
  };

  // Reorder: Task C becomes order 0, Task B becomes order 1
  const reorderedTasks = [
    { ...taskC, order: 0 },
    { ...taskB, order: 1 },
    movedTask!,
  ];

  storageAdapter.set(STORAGE_KEYS.PROJECTS, {
    ...savedData,
    tasks: reorderedTasks,
  });

  const reorderedData = storageAdapter.get<{ tasks: ProjectTask[] }>(STORAGE_KEYS.PROJECTS, { tasks: [] });
  const sortedColTodo = reorderedData.tasks
    .filter((t) => t.columnId === 'col-todo')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  assert(sortedColTodo[0].id === 'task-c', `First task in col-todo should be 'task-c', got '${sortedColTodo[0].id}'`);
  assert(sortedColTodo[1].id === 'task-b', `Second task in col-todo should be 'task-b', got '${sortedColTodo[1].id}'`);

  // 4. Task Completion Persistence
  const completedTask = { ...movedTask!, columnId: 'col-done', completedAt: Date.now() };
  storageAdapter.set(STORAGE_KEYS.PROJECTS, {
    ...savedData,
    tasks: [sortedColTodo[0], sortedColTodo[1], completedTask],
  });

  const finalData = storageAdapter.get<{ tasks: ProjectTask[] }>(STORAGE_KEYS.PROJECTS, { tasks: [] });
  const doneTask = finalData.tasks.find((t) => t.id === 'task-a');

  assert(doneTask?.columnId === 'col-done', 'Task A should be in col-done');
  assert(doneTask?.completedAt !== undefined, 'Task A must have completedAt timestamp');

  console.log('✅ Projects, Kanban & Tasks Tests PASSED (4/4)');
}
