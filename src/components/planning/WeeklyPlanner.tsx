'use client';

import React, { useState, useMemo } from 'react';
import { PlannerActivity } from '@/types/planner';
import { getTodayYMD, formatYMD, getStartOfLocalWeek } from '@/lib/date';
import { ActivityModal } from '@/components/planning/ActivityModal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  Trash2,
} from 'lucide-react';

interface WeeklyPlannerProps {
  activities: PlannerActivity[];
  onAddActivity: (actData: Omit<PlannerActivity, 'id' | 'createdAt'>) => PlannerActivity;
  onUpdateActivity: (id: string, updates: Partial<PlannerActivity>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteActivity: (id: string) => void;
}

const WEEK_NAMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  activities,
  onAddActivity,
  onUpdateActivity,
  onToggleComplete,
  onDeleteActivity,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<PlannerActivity | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  const todayStr = getTodayYMD();

  // Calculate Start of Week (Monday)
  const weekDays = useMemo(() => {
    const startOfWeek = getStartOfLocalWeek(currentDate);

    const days: { date: Date; dateStr: string; label: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(startOfWeek);
      cur.setDate(cur.getDate() + i);
      days.push({
        date: cur,
        dateStr: formatYMD(cur),
        label: WEEK_NAMES[i],
      });
    }
    return days;
  }, [currentDate]);

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleThisWeek = () => {
    setCurrentDate(new Date());
  };

  const handleOpenAddModal = (dateStr?: string) => {
    setActivityToEdit(null);
    setSelectedDateStr(dateStr || formatYMD(currentDate));
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Planejamento Semanal</h2>
            <p className="text-xs text-zinc-400 font-medium">Visão ampla da sua semana de trabalho</p>
          </div>
        </div>

        {/* Week Navigator Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
            <button
              onClick={handlePrevWeek}
              className="py-1.5 px-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline">Semana anterior</span>
            </button>

            <button
              onClick={handleThisWeek}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-indigo-400 hover:bg-zinc-800 transition-colors"
            >
              Esta semana
            </button>

            <button
              onClick={handleNextWeek}
              className="py-1.5 px-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1"
            >
              <span className="hidden md:inline">Próxima semana</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="py-2 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* 7 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map(({ date, dateStr, label }, idx) => {
          const isToday = dateStr === todayStr;
          const dayActivities = activities
            .filter((a) => a.dateString === dateStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-3xl border flex flex-col justify-between min-h-[360px] space-y-3 transition-all ${
                isToday
                  ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                    {label}
                  </span>
                  <span className={`text-base font-extrabold font-mono ${isToday ? 'text-indigo-400' : 'text-white'}`}>
                    {date.getDate()}/{date.getMonth() + 1}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenAddModal(dateStr)}
                  className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Day Activities List */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px]">
                {dayActivities.length === 0 ? (
                  <span className="text-[11px] text-zinc-600 block text-center pt-8">
                    Vazio
                  </span>
                ) : (
                  dayActivities.map((act) => (
                    <div
                      key={act.id}
                      className={`p-2.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                        act.isCompleted
                          ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                          : 'bg-zinc-950 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <button
                          onClick={() => onToggleComplete(act.id)}
                          className="mt-0.5 text-zinc-500 hover:text-emerald-400"
                        >
                          {act.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <span
                          className={`font-bold flex-1 truncate ${
                            act.isCompleted ? 'line-through text-zinc-500' : 'text-white'
                          }`}
                        >
                          {act.title}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-900">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          {act.startTime}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(act)}
                            className="p-0.5 hover:text-white"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteActivity(act.id)}
                            className="p-0.5 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ActivityModal
        isOpen={isModalOpen}
        activityToEdit={activityToEdit}
        defaultDate={selectedDateStr}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={onDeleteActivity}
      />
    </div>
  );
};
