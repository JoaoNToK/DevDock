'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStudies } from '@/hooks/useStudies';
import { SubjectModal } from '@/components/studies/SubjectModal';
import { Subject } from '@/types/studies';
import { BookOpen, Plus, Clock, CheckCircle2, ArrowRight, Pencil, Trash2 } from 'lucide-react';

export default function MateriasPage() {
  const {
    isMounted,
    subjects,
    topics,
    getSubjectProgress,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useStudies();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  const handleOpenAdd = () => {
    setSubjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setSubjectToEdit(sub);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<Subject, 'id' | 'totalTimeMinutes' | 'createdAt'>) => {
    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, data);
    } else {
      addSubject(data);
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
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Matérias &amp; Disciplinas</h2>
              <p className="text-xs text-zinc-400 font-medium">Gerencie suas disciplinas e metas de aprendizado</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Matéria</span>
          </button>
        </div>

        {/* Subjects Cards Grid */}
        {subjects.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-3">
            <p>Nenhuma matéria cadastrada ainda.</p>
            <button
              onClick={handleOpenAdd}
              className="py-2 px-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs"
            >
              + Adicionar Primeira Matéria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => {
              const pct = getSubjectProgress(sub.id);
              const subTopics = topics.filter((t) => t.subjectId === sub.id);
              const completed = subTopics.filter((t) => t.status === 'completed').length;
              const hoursStudied = (sub.totalTimeMinutes / 60).toFixed(1);

              return (
                <div
                  key={sub.id}
                  className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4 flex flex-col justify-between hover:border-zinc-700 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Header bar with color */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-4 h-4 rounded-full shadow-md"
                          style={{ backgroundColor: sub.color }}
                        />
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {sub.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {sub.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{sub.description}</p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-400">Progresso</span>
                        <span className="font-mono text-white">{pct}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden p-0.5 border border-zinc-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: sub.color }}
                        />
                      </div>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2 border-t border-zinc-800/60">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{completed}/{subTopics.length} conteúdos</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{hoursStudied}h estudadas</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/estudos/materias/${sub.id}`}
                    className="w-full py-2.5 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Abrir Matéria</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <SubjectModal
          isOpen={isModalOpen}
          subjectToEdit={subjectToEdit}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onDelete={deleteSubject}
        />
      </div>
    </MainLayout>
  );
}
