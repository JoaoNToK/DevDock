'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AcademicSubject, AcademicSemester } from '@/types/academic';
import { X, Trash2 } from 'lucide-react';

interface AcademicSubjectModalProps {
  isOpen: boolean;
  subjectToEdit?: AcademicSubject | null;
  semesters: AcademicSemester[];
  defaultSemesterId?: string;
  onClose: () => void;
  onSave: (data: Omit<AcademicSubject, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
}

const COLORS = [
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#ef4444', // Red
];

const DAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const AcademicSubjectModal: React.FC<AcademicSubjectModalProps> = ({
  isOpen,
  subjectToEdit,
  semesters,
  defaultSemesterId,
  onClose,
  onSave,
  onDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const [semesterId, setSemesterId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [professor, setProfessor] = useState('');
  const [classroom, setClassroom] = useState('');
  const [classDay, setClassDay] = useState(DAYS[0]);
  const [classTime, setClassTime] = useState('19:00 - 20:40');
  const [workloadHours, setWorkloadHours] = useState(80);
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (subjectToEdit) {
      setSemesterId(subjectToEdit.semesterId);
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code || '');
      setProfessor(subjectToEdit.professor || '');
      setClassroom(subjectToEdit.classroom || '');
      setClassDay(subjectToEdit.classDay || DAYS[0]);
      setClassTime(subjectToEdit.classTime || '19:00 - 20:40');
      setWorkloadHours(subjectToEdit.workloadHours || 80);
      setColor(subjectToEdit.color || COLORS[0]);
    } else {
      setSemesterId(defaultSemesterId || semesters[0]?.id || '');
      setName('');
      setCode('');
      setProfessor('');
      setClassroom('');
      setClassDay(DAYS[0]);
      setClassTime('19:00 - 20:40');
      setWorkloadHours(80);
      setColor(COLORS[0]);
    }
  }, [subjectToEdit, defaultSemesterId, semesters, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !semesterId) return;

    onSave({
      semesterId,
      name: name.trim(),
      code: code.trim(),
      professor: professor.trim(),
      classroom: classroom.trim(),
      classDay,
      classTime: classTime.trim(),
      workloadHours: Number(workloadHours) || 60,
      color,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">
            {subjectToEdit ? 'Editar Disciplina' : 'Nova Disciplina da Faculdade'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Semestre Pertencente</label>
            <select
              required
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Nome da Disciplina</label>
            <input
              type="text"
              required
              placeholder="Ex: Banco de Dados, Programação Web..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Código (Opcional)</label>
              <input
                type="text"
                placeholder="BD-301"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Professor(a)</label>
              <input
                type="text"
                placeholder="Prof. João Silva"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Dia da Aula</label>
              <select
                value={classDay}
                onChange={(e) => setClassDay(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Horário da Aula</label>
              <input
                type="text"
                placeholder="19:00 - 20:40"
                value={classTime}
                onChange={(e) => setClassTime(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Sala / Laboratório</label>
              <input
                type="text"
                placeholder="Lab 04 / Sala 12"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Carga Horária (Horas)</label>
              <input
                type="number"
                min={10}
                max={300}
                required
                value={workloadHours}
                onChange={(e) => setWorkloadHours(Number(e.target.value))}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Cor da Disciplina</label>
            <div className="flex items-center gap-1.5 pt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {subjectToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(subjectToEdit.id);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                Salvar Disciplina
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
