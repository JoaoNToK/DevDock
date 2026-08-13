'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAcademic } from '@/hooks/useAcademic';
import { AcademicSubjectModal } from '@/components/academic/AcademicSubjectModal';
import { AcademicSubject } from '@/types/academic';
import { BookOpen, Plus, Pencil, Trash2, Clock, User, MapPin } from 'lucide-react';

export default function DisciplinasPage() {
  const {
    isMounted,
    semesters,
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useAcademic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<AcademicSubject | null>(null);

  const handleOpenAdd = () => {
    setSubjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: AcademicSubject) => {
    setSubjectToEdit(sub);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<AcademicSubject, 'id' | 'createdAt'>) => {
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
          <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Disciplinas da Faculdade</h2>
              <p className="text-xs text-zinc-400 font-medium">Gerencie matérias, professores, horários e salas de aula</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Disciplina</span>
          </button>
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            Nenhuma disciplina cadastrada na faculdade.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => {
              const sem = semesters.find((s) => s.id === sub.semesterId);
              return (
                <div
                  key={sub.id}
                  className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4 flex flex-col justify-between hover:border-zinc-700 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-4 h-4 rounded-full shadow-md"
                          style={{ backgroundColor: sub.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {sub.name}
                            </h3>
                            {sub.code && (
                              <span className="px-2 py-0.5 rounded bg-zinc-950 text-[10px] font-mono text-zinc-400 border border-zinc-800">
                                {sub.code}
                              </span>
                            )}
                          </div>
                          {sem && <p className="text-[10px] text-emerald-400 font-semibold">{sem.name}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs text-zinc-300">
                      {sub.professor && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{sub.professor}</span>
                        </div>
                      )}

                      {sub.classDay && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{sub.classDay} ({sub.classTime || ''})</span>
                        </div>
                      )}

                      {sub.classroom && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{sub.classroom}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs font-mono">
                    <span className="text-zinc-400">Carga Horária</span>
                    <span className="text-emerald-400 font-bold">{sub.workloadHours}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AcademicSubjectModal
          isOpen={isModalOpen}
          subjectToEdit={subjectToEdit}
          semesters={semesters}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onDelete={deleteSubject}
        />
      </div>
    </MainLayout>
  );
}
