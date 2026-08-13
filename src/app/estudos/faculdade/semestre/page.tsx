'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAcademic } from '@/hooks/useAcademic';
import { Calendar, Plus, CheckCircle2, Clock, BookOpen, Trash2 } from 'lucide-react';

export default function SemestrePage() {
  const {
    isMounted,
    course,
    semesters,
    subjects,
    addSemester,
    updateSemester,
    deleteSemester,
  } = useAcademic();

  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleAddSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !period.trim()) return;

    addSemester({
      name: name.trim(),
      period: period.trim(),
      startDate: startDate || '2026-08-01',
      endDate: endDate || '2026-12-15',
      isCurrent: false,
    });

    setName('');
    setPeriod('');
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
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Semestres &amp; Histórico Acadêmico</h2>
              <p className="text-xs text-zinc-400 font-medium">Acompanhe semestres atuais e anteriores do curso</p>
            </div>
          </div>
        </div>

        {/* Add Semester Form */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Cadastrar Novo Semestre</span>
          </h3>

          <form onSubmit={handleAddSemester} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              required
              placeholder="Ex: 2027.1 - 4º Semestre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              required
              placeholder="Período ex: 2027.1"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Semestre</span>
            </button>
          </form>
        </div>

        {/* Semestres List */}
        <div className="space-y-4">
          {semesters.map((sem) => {
            const semSubjects = subjects.filter((s) => s.semesterId === sem.id);
            return (
              <div
                key={sem.id}
                className={`p-6 rounded-3xl border backdrop-blur-xl space-y-4 transition-all ${
                  sem.isCurrent
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-xl shadow-emerald-500/5'
                    : 'bg-zinc-900/80 border-zinc-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{sem.name}</h3>
                    {sem.isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Atual
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!sem.isCurrent && (
                      <button
                        onClick={() => {
                          semesters.forEach((s) => updateSemester(s.id, { isCurrent: s.id === sem.id }));
                        }}
                        className="py-1 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
                      >
                        Definir como Atual
                      </button>
                    )}
                    <button
                      onClick={() => deleteSemester(sem.id)}
                      className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Semestre Disciplinas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-800/60">
                  {semSubjects.length === 0 ? (
                    <p className="text-xs text-zinc-500 col-span-3">Nenhuma disciplina cadastrada neste semestre.</p>
                  ) : (
                    semSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                          <span className="font-bold text-white truncate max-w-[140px]">{sub.name}</span>
                        </div>
                        <span className="font-mono text-emerald-400 text-[11px]">{sub.workloadHours}h</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
