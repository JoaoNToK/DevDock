'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAcademic } from '@/hooks/useAcademic';
import { AssignmentModal } from '@/components/academic/AssignmentModal';
import { AcademicLinksFilesManager } from '@/components/academic/AcademicLinksFilesManager';
import { AcademicAssignment, AssignmentStatus } from '@/types/academic';
import { FileText, Plus, Pencil, Trash2, CheckSquare, AlertCircle } from 'lucide-react';

export default function TrabalhosPage() {
  const {
    isMounted,
    subjects,
    assignments,
    links,
    files,
    addAssignment,
    updateAssignment,
    setAssignmentStatus,
    toggleChecklistItem,
    deleteAssignment,
    addLink,
    deleteLink,
    addFile,
    deleteFile,
  } = useAcademic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<AcademicAssignment | null>(null);

  const works = assignments.filter((a) =>
    ['trabalho', 'atividade', 'tde', 'outro'].includes(a.type)
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
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Trabalhos &amp; Entregas Acadêmicas</h2>
              <p className="text-xs text-zinc-400 font-medium">Acompanhe etapas de trabalhos, checklists e prazos de entrega</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Trabalho / TDE</span>
          </button>
        </div>

        {/* Works List */}
        {works.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            Nenhum trabalho ou TDE cadastrado.
          </div>
        ) : (
          <div className="space-y-4">
            {works.map((work) => {
              const sub = subjects.find((s) => s.id === work.subjectId);
              const completedChecklist = work.checklist.filter((i) => i.isCompleted).length;
              const checklistPct =
                work.checklist.length > 0
                  ? Math.round((completedChecklist / work.checklist.length) * 100)
                  : 0;

              return (
                <div
                  key={work.id}
                  className={`p-6 rounded-3xl border backdrop-blur-xl space-y-4 transition-all ${
                    work.status === 'overdue'
                      ? 'bg-red-950/20 border-red-500/40 shadow-xl shadow-red-500/5'
                      : work.status === 'submitted'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-zinc-900/80 border-zinc-800/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {sub && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                            style={{ backgroundColor: sub.color }}
                          >
                            {sub.name}
                          </span>
                        )}

                        {work.status === 'overdue' && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-extrabold text-[10px] uppercase border border-red-500/40 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Atrasado
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white mt-1">{work.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={work.status}
                        onChange={(e) => setAssignmentStatus(work.id, e.target.value as AssignmentStatus)}
                        className="py-1.5 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-200 focus:outline-none"
                      >
                        <option value="not_started">Não iniciado</option>
                        <option value="in_progress">Em andamento</option>
                        <option value="review">Em revisão</option>
                        <option value="submitted">Entregue</option>
                        <option value="overdue">Atrasado</option>
                      </select>

                      <button
                        onClick={() => handleOpenEdit(work)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAssignment(work.id)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {work.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed">{work.description}</p>
                  )}

                  {/* Checklist & Progress */}
                  {work.checklist.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                      <div className="flex items-center justify-between text-xs font-bold font-mono">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                          Etapas do Trabalho ({completedChecklist}/{work.checklist.length})
                        </span>
                        <span className="text-emerald-400">{checklistPct}%</span>
                      </div>

                      <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${checklistPct}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                        {work.checklist.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:bg-zinc-900 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={item.isCompleted}
                              onChange={() => toggleChecklistItem(work.id, item.id)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                            />
                            <span className={item.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-mono text-zinc-400">
                    <span>Entrega: <strong className="text-emerald-400">{work.dueDate}</strong> ({work.dueTime || '23:59'})</span>
                    {work.location && <span>Local: {work.location}</span>}
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <AcademicLinksFilesManager
                      assignmentId={work.id}
                      subjectId={work.subjectId}
                      links={links}
                      files={files}
                      onAddLink={addLink}
                      onDeleteLink={deleteLink}
                      onAddFile={addFile}
                      onDeleteFile={deleteFile}
                    />
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
          defaultType="trabalho"
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onDelete={deleteAssignment}
        />
      </div>
    </MainLayout>
  );
}
