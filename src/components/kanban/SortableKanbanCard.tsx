'use client';

import React from 'react';
import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProjectTask } from '@/types/projects';
import {
  CheckSquare,
  Clock,
  GripVertical,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SortableKanbanCardProps {
  task: ProjectTask;
  columnIdx: number;
  totalCols: number;
  cols: { id: string; name: string }[];
  onEdit: (task: ProjectTask) => void;
  onMoveColumn: (taskId: string, targetColId: string) => void;
}

const SortableKanbanCardComponent: React.FC<SortableKanbanCardProps> = ({
  task,
  columnIdx,
  totalCols,
  cols,
  onEdit,
  onMoveColumn,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const completedChk = task.checklist ? task.checklist.filter((i) => i.isCompleted).length : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-2xl theme-card border hover:border-[var(--text-primary)] transition-all space-y-2 text-xs shadow-md group relative ${
        isDragging ? 'ring-2 ring-[var(--text-primary)] opacity-40 scale-[0.98]' : ''
      }`}
    >
      {/* Top Header with Drag Handle & Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Drag Handle Icon for Touch & Mouse */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-0.5 text-tertiary-theme hover:text-primary-theme cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-zinc-800/40 touch-none shrink-0"
            title="Arrastar para reordenar ou mover"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <h4
            onClick={() => onEdit(task)}
            className="font-bold text-primary-theme hover:underline cursor-pointer leading-snug truncate"
          >
            {task.title}
          </h4>
        </div>

        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
            task.priority === 'urgent'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : task.priority === 'high'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'theme-card-elevated text-secondary-theme border'
          }`}
        >
          {task.priority === 'urgent' ? 'Urgente' : task.priority === 'high' ? 'Alta' : 'Normal'}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p
          onClick={() => onEdit(task)}
          className="text-[11px] text-secondary-theme line-clamp-2 leading-relaxed cursor-pointer pl-6"
        >
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-6 pt-1">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full theme-card-elevated border text-[10px] text-secondary-theme font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Badges & Direct Pomodoro Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-[10px]">
        <div className="flex items-center gap-2">
          {task.checklist && task.checklist.length > 0 && (
            <span className="flex items-center gap-1 text-primary-theme font-mono font-bold">
              <CheckSquare className="w-3 h-3" />
              {completedChk}/{task.checklist.length}
            </span>
          )}

          {task.dueDate && (
            <span className="flex items-center gap-1 text-secondary-theme font-mono">
              <Clock className="w-3 h-3 text-secondary-theme" />
              {task.dueDate}
            </span>
          )}
        </div>

        {/* ▶ Start Pomodoro Directly for this Task */}
        <Link
          href={`/pomodoro?projectId=${task.projectId}&taskId=${task.id}`}
          className="btn-secondary py-1 px-2.5 rounded-xl text-[10px] flex items-center gap-1 shadow-sm hover:scale-105 transition-transform"
          title="Iniciar sessão Pomodoro para esta tarefa"
        >
          <Play className="w-3 h-3 fill-current text-primary-theme" />
          <span>Foco</span>
        </Link>
      </div>

      {/* Quick Accessible Column Select Shift */}
      <div className="flex items-center justify-between pt-1 border-t text-[10px]">
        <button
          type="button"
          disabled={columnIdx === 0}
          onClick={() => onMoveColumn(task.id, cols[columnIdx - 1].id)}
          className="p-1 rounded text-tertiary-theme hover:text-primary-theme disabled:opacity-20"
          title="Mover para coluna anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <select
          value={task.columnId}
          onChange={(e) => onMoveColumn(task.id, e.target.value)}
          className="py-0.5 px-1.5 rounded-lg theme-card-elevated border text-[10px] text-secondary-theme font-bold focus:outline-none"
        >
          {cols.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={columnIdx === totalCols - 1}
          onClick={() => onMoveColumn(task.id, cols[columnIdx + 1].id)}
          className="p-1 rounded text-tertiary-theme hover:text-primary-theme disabled:opacity-20"
          title="Mover para próxima coluna"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const SortableKanbanCard = React.memo(
  SortableKanbanCardComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.title === nextProps.task.title &&
      prevProps.task.description === nextProps.task.description &&
      prevProps.task.columnId === nextProps.task.columnId &&
      prevProps.task.priority === nextProps.task.priority &&
      prevProps.task.dueDate === nextProps.task.dueDate &&
      prevProps.columnIdx === nextProps.columnIdx &&
      prevProps.totalCols === nextProps.totalCols &&
      JSON.stringify(prevProps.task.checklist) === JSON.stringify(nextProps.task.checklist) &&
      JSON.stringify(prevProps.task.tags) === JSON.stringify(nextProps.task.tags)
    );
  }
);
