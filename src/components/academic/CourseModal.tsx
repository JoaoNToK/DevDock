'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AcademicCourse } from '@/types/academic';
import { X } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  course: AcademicCourse;
  onClose: () => void;
  onSave: (data: Partial<AcademicCourse>) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  course,
  onClose,
  onSave,
}) => {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [currentSemesterName, setCurrentSemesterName] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (course) {
      setName(course.name);
      setInstitution(course.institution || '');
      setCurrentSemesterName(course.currentSemesterName || '3º Semestre');
      setCurrentPeriod(course.currentPeriod || '2026.2');
      setYear(course.year || 2026);
    }
  }, [course, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      institution: institution.trim(),
      currentSemesterName: currentSemesterName.trim(),
      currentPeriod: currentPeriod.trim(),
      year: Number(year) || 2026,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">Editar Dados do Curso</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Nome do Curso</label>
            <input
              type="text"
              required
              placeholder="Ex: Análise e Desenvolvimento de Sistemas, Engenharia..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Instituição de Ensino / Faculdade</label>
            <input
              type="text"
              placeholder="Ex: USP, UNICAMP, Faculdade Tech..."
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Semestre Atual</label>
              <input
                type="text"
                placeholder="Ex: 3º Semestre"
                value={currentSemesterName}
                onChange={(e) => setCurrentSemesterName(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Período / Ano</label>
              <input
                type="text"
                placeholder="Ex: 2026.2"
                value={currentPeriod}
                onChange={(e) => setCurrentPeriod(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all"
            >
              Salvar Curso
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
