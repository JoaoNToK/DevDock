'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlannerActivity } from '@/types/planner';
import { ActivityModal } from '@/components/planning/ActivityModal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sun,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Play,
  Pencil,
  Trash2,
} from 'lucide-react';

interface DailyPlannerProps {
  activities: PlannerActivity[];
  onAddActivity: (actData: Omit<PlannerActivity, 'id' | 'createdAt'>) => PlannerActivity;
  onUpdateActivity: (id: string, updates: Partial<PlannerActivity>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteActivity: (id: string) => void;
}

export const DailyPlanner: React.FC<DailyPlannerProps> = ({
  activities,
  onAddActivity,
  onUpdateActivity,
  onToggleComplete,
  onDeleteActivity,
}) => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dailyGoalText, setDailyGoalText] = useState('Definir meta do dia...');
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<PlannerActivity | null>(null);

  const formatYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentDateStr = formatYMD(currentDate);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const dayActivities = activities
    .filter((a) => a.dateString === currentDateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completedCount = dayActivities.filter((a) => a.isCompleted).length;

  const handleStartPomodoroForActivity = (activity: PlannerActivity) => {
    // Navigate to /pomodoro
    router.push('/pomodoro');
  };

  const handleOpenAddModal = () => {
    setActivityToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (act: PlannerActivity) => {
    setActivityToEdit(act);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<PlannerActivity, 'id' | 'createdAt'>) => {
    if (activityToEdit) {
      onUpdateActivity(activityToEdit.id, data);
    } else {
      onAddActivity(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Planejamento Diário</h2>
            <p className="text-xs text-zinc-400 font-medium">Organize seu dia passo a passo</p>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-extrabold text-white min-w-[130px] text-center">
              {currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="py-2 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-indigo-400 hover:bg-zinc-800 transition-colors"
          >
            Hoje
          </button>

          <button
            onClick={handleOpenAddModal}
            className="py-2 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Meta do Dia Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">
              Meta do Dia
            </span>
            {isEditingGoal ? (
              <input
                type="text"
                autoFocus
                value={dailyGoalText}
                onChange={(e) => setDailyGoalText(e.target.value)}
                onBlur={() => setIsEditingGoal(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingGoal(false)}
                className="py-1 px-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm font-bold text-white focus:outline-none"
              />
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingGoal(true)}>
                <span className="text-sm sm:text-base font-extrabold text-white">{dailyGoalText}</span>
                <Pencil className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Daily Progress Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-semibold">
          <span className="text-zinc-400">Concluídas:</span>
          <span className="text-emerald-400 font-extrabold font-mono">
            {completedCount} / {dayActivities.length}
          </span>
        </div>
      </div>

      {/* Timeline Schedule */}
      <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
          Cronograma de Atividades ({dayActivities.length})
        </h3>

        {dayActivities.length === 0 ? (
          <div className="p-10 text-center text-xs text-zinc-500 space-y-2">
            <p>Nenhuma atividade planejada para este dia.</p>
            <button
              onClick={handleOpenAddModal}
              className="py-2 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-indigo-400 font-bold text-xs transition-colors"
            >
              + Adicionar primeira atividade
            </button>
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-zinc-800/60">
            {dayActivities.map((act) => (
              <div
                key={act.id}
                className={`pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl transition-all ${
                  act.isCompleted ? 'bg-zinc-950/40 opacity-75' : 'bg-zinc-950 border border-zinc-800/80'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleComplete(act.id)}
                    className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    {act.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        act.isCompleted ? 'line-through text-zinc-500' : 'text-white'
                      }`}
                    >
                      {act.title}
                    </h4>
                    {act.description && (
                      <p className="text-xs text-zinc-400 mt-0.5">{act.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {act.startTime} ({act.durationMinutes} min)
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 font-semibold text-zinc-300">
                        {act.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  {!act.isCompleted && (
                    <button
                      onClick={() => handleStartPomodoroForActivity(act)}
                      className="py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Focar no Pomodoro</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEditModal(act)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteActivity(act.id)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ActivityModal
        isOpen={isModalOpen}
        activityToEdit={activityToEdit}
        defaultDate={currentDateStr}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={onDeleteActivity}
      />
    </div>
  );
};
