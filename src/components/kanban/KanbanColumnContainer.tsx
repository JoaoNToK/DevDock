'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn, ProjectTask } from '@/types/projects';
import { SortableKanbanCard } from './SortableKanbanCard';
import { Plus, Trash2 } from 'lucide-react';

interface KanbanColumnContainerProps {
  column: KanbanColumn;
  columnIdx: number;
  totalCols: number;
  allCols: KanbanColumn[];
  tasks: ProjectTask[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteColumn: (columnId: string) => void;
  onMoveColumn: (taskId: string, targetColId: string) => void;
}

export const KanbanColumnContainer: React.FC<KanbanColumnContainerProps> = ({
  column,
  columnIdx,
  totalCols,
  allCols,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteColumn,
  onMoveColumn,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={`w-80 min-w-[300px] rounded-3xl theme-surface border p-4 space-y-3 flex-shrink-0 flex flex-col justify-between transition-all ${
        isOver ? 'ring-2 ring-[var(--text-primary)] border-[var(--text-primary)] theme-card-elevated' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color || '#6366f1' }} />
          <h3 className="font-extrabold text-xs tracking-wider text-primary-theme uppercase">{column.name}</h3>
          <span className="px-2 py-0.5 rounded-full theme-card-elevated border text-[10px] font-mono text-secondary-theme font-bold">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddTask(column.id)}
            className="p-1 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-zinc-800/40"
            title="Adicionar tarefa nesta coluna"
          >
            <Plus className="w-4 h-4" />
          </button>

          {totalCols > 1 && (
            <button
              type="button"
              onClick={() => onDeleteColumn(column.id)}
              className="p-1 rounded-lg text-tertiary-theme hover:text-red-400 hover:bg-zinc-800/40"
              title="Excluir coluna"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sortable Task List Area */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5 min-h-[160px] flex-1">
          {tasks.length === 0 ? (
            <div className="p-6 text-center text-[11px] text-tertiary-theme border border-dashed rounded-2xl">
              Arraste tarefas aqui ou clique em + Adicionar
            </div>
          ) : (
            tasks.map((task) => (
              <SortableKanbanCard
                key={task.id}
                task={task}
                columnIdx={columnIdx}
                totalCols={totalCols}
                cols={allCols}
                onEdit={onEditTask}
                onMoveColumn={onMoveColumn}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Add Task Button at bottom of column */}
      <button
        type="button"
        onClick={() => onAddTask(column.id)}
        className="w-full py-2 px-3 rounded-2xl theme-card hover:theme-card-elevated border text-secondary-theme hover:text-primary-theme text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-3"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Adicionar Tarefa</span>
      </button>
    </div>
  );
};
