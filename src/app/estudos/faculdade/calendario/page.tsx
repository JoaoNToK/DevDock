'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAcademic } from '@/hooks/useAcademic';
import { Calendar as CalendarIcon, Filter, MapPin, Clock, Tag } from 'lucide-react';

export default function CalendarioAcademicoPage() {
  const { isMounted, subjects, assignments } = useAcademic();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  const filteredAssignments = assignments.filter((a) => {
    if (selectedType !== 'all' && a.type !== selectedType) return false;
    if (selectedSubjectId !== 'all' && a.subjectId !== selectedSubjectId) return false;
    return true;
  });

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
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Calendário Acadêmico</h2>
              <p className="text-xs text-zinc-400 font-medium">Visualização integrada de todas as provas, entregas e aulas</p>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-400" />
            Filtrar Compromissos:
          </span>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="py-2 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="prova">📝 Provas</option>
            <option value="trabalho">📄 Trabalhos</option>
            <option value="atividade">📚 Atividades</option>
            <option value="apresentacao">🎤 Apresentações</option>
            <option value="tde">📋 TDE</option>
            <option value="projeto">🧪 Projetos</option>
          </select>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="py-2 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas as Disciplinas</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Events Timeline List */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Nenhum compromisso acadêmico encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssignments.map((assig) => {
                const sub = subjects.find((s) => s.id === assig.subjectId);
                return (
                  <div
                    key={assig.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-emerald-400 font-bold font-mono text-center min-w-[70px]">
                        <span>{assig.dueDate.split('-').slice(1).join('/')}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ backgroundColor: sub?.color || '#6366f1' }}
                          >
                            {sub?.name || 'Geral'}
                          </span>
                          <span className="text-zinc-400 text-[10px] uppercase font-bold">
                            {assig.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm mt-0.5">{assig.title}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-zinc-400 text-[11px] font-mono w-full sm:w-auto justify-end">
                      {assig.dueTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {assig.dueTime}
                        </span>
                      )}

                      {assig.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          {assig.location}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
