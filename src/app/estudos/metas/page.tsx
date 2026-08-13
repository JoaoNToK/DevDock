'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStudies } from '@/hooks/useStudies';
import { GoalModal } from '@/components/studies/GoalModal';
import { StudyGoal } from '@/types/studies';
import { Target, Plus, Pencil, Trash2 } from 'lucide-react';

export default function MetasPage() {
  const {
    isMounted,
    subjects,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
  } = useStudies();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<StudyGoal | null>(null);

  const handleOpenAdd = () => {
    setGoalToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: StudyGoal) => {
    setGoalToEdit(g);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<StudyGoal, 'id' | 'currentValue' | 'createdAt'>) => {
    if (goalToEdit) {
      updateGoal(goalToEdit.id, data);
    } else {
      addGoal(data);
    }
  };

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Metas de Aprendizado</h2>
              <p className="text-xs text-zinc-400 font-medium">Defina objetivos de estudo e acompanhe a evolução</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Meta</span>
          </button>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            Nenhuma meta cadastrada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const sub = subjects.find((s) => s.id === goal.subjectId);
              const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

              return (
                <div
                  key={goal.id}
                  className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        {sub && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white mb-1 inline-block"
                            style={{ backgroundColor: sub.color }}
                          >
                            {sub.name}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-white">{goal.title}</h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(goal)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold font-mono">
                        <span className="text-zinc-400">Progresso</span>
                        <span className="text-emerald-400">
                          {goal.currentValue} / {goal.targetValue} {goal.type === 'hours' ? 'horas' : goal.type === 'topics' ? 'conteúdos' : 'sessões'} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden p-0.5 border border-zinc-800">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <GoalModal
          isOpen={isModalOpen}
          goalToEdit={goalToEdit}
          subjects={subjects}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onDelete={deleteGoal}
        />
      </div>
    </MainLayout>
  );
}
