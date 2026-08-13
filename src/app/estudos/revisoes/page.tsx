'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStudies } from '@/hooks/useStudies';
import { Calendar, CheckCircle2, Clock, Tag } from 'lucide-react';

export default function RevisoesPage() {
  const { isMounted, subjects, topics, setTopicStatus } = useStudies();

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  // Active topics that require review
  const reviewTopics = topics.filter((t) => t.status === 'in_progress' || t.nextReviewDate);

  const handleCompleteReview = (topicId: string) => {
    // Toggles topic to completed or advances review interval
    setTopicStatus(topicId, 'completed');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Revisões Programadas</h2>
              <p className="text-xs text-zinc-400 font-medium">Reforce o aprendizado com revisões periódicas</p>
            </div>
          </div>
        </div>

        {/* Revisar Hoje Section */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📌 Tópicos para Revisar Hoje ({reviewTopics.length})</span>
          </h3>

          {reviewTopics.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Nenhum tópico com revisão pendente hoje! Excelente trabalho! 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {reviewTopics.map((top) => {
                const sub = subjects.find((s) => s.id === top.subjectId);
                return (
                  <div
                    key={top.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: sub?.color || '#6366f1' }}
                          >
                            {sub?.name || 'Geral'}
                          </span>
                          <span className="text-zinc-500 text-[10px]">Intervalo: {top.reviewIntervalDays || 1} dias</span>
                        </div>
                        <h4 className="font-bold text-white text-sm mt-0.5">{top.title}</h4>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCompleteReview(top.id)}
                      className="py-2 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir Revisão</span>
                    </button>
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
