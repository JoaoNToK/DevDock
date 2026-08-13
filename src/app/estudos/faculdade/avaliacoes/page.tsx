'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAcademic } from '@/hooks/useAcademic';
import { AssignmentModal } from '@/components/academic/AssignmentModal';
import { AcademicAssignment } from '@/types/academic';
import { Calendar, Plus, Pencil, Trash2, MapPin, Clock, Award } from 'lucide-react';

export default function AvaliacoesPage() {
  const {
    isMounted,
    subjects,
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  } = useAcademic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<AcademicAssignment | null>(null);

  const exams = assignments.filter((a) =>
    ['prova', 'apresentacao', 'seminario', 'projeto'].includes(a.type)
  );

  const handleOpenAdd = () => {
    setAssignmentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: AcademicAssignment) => {
    setAssignmentToEdit(a);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<AcademicAssignment, 'id' | 'createdAt'>) => {
    if (assignmentToEdit) {
      updateAssignment(assignmentToEdit.id, data);
    } else {
      addAssignment(data);
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
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Avaliações, Provas &amp; Apresentações</h2>
              <p className="text-xs text-zinc-400 font-medium">Acompanhe datas de provas, locais e conteúdos cobrados</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Prova / Avaliação</span>
          </button>
        </div>

        {/* Exams List */}
        {exams.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            Nenhuma prova ou avaliação cadastrada no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((assig) => {
              const sub = subjects.find((s) => s.id === assig.subjectId);
              return (
                <div
                  key={assig.id}
                  className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        {sub && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white mb-1.5 inline-block"
                            style={{ backgroundColor: sub.color }}
                          >
                            {sub.name}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-white">{assig.title}</h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(assig)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAssignment(assig.id)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {assig.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{assig.description}</p>
                    )}

                    <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs text-zinc-300">
                      <div className="flex items-center justify-between font-mono">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <Calendar className="w-4 h-4" />
                          {assig.dueDate}
                        </span>
                        {assig.dueTime && (
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Clock className="w-3.5 h-3.5" />
                            {assig.dueTime}
                          </span>
                        )}
                      </div>

                      {assig.location && (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{assig.location}</span>
                        </div>
                      )}

                      {assig.weight && (
                        <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                          <Award className="w-3.5 h-3.5" />
                          <span>Peso / Nota: {assig.weight}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AssignmentModal
          isOpen={isModalOpen}
          assignmentToEdit={assignmentToEdit}
          subjects={subjects}
          defaultType="prova"
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onDelete={deleteAssignment}
        />
      </div>
    </MainLayout>
  );
}
