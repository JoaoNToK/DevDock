'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStudies } from '@/hooks/useStudies';
import { TopicModal } from '@/components/studies/TopicModal';
import { Topic, TopicStatus } from '@/types/studies';
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';

export default function ConteudosPage() {
  const {
    isMounted,
    subjects,
    topics,
    addTopic,
    updateTopic,
    setTopicStatus,
    deleteTopic,
  } = useStudies();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);

  const filteredTopics = topics.filter((t) => {
    if (selectedSubjectId !== 'all' && t.subjectId !== selectedSubjectId) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setTopicToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (top: Topic) => {
    setTopicToEdit(top);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<Topic, 'id' | 'totalTimeMinutes' | 'createdAt'>) => {
    if (topicToEdit) {
      updateTopic(topicToEdit.id, data);
    } else {
      addTopic(data);
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
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Conteúdos &amp; Tópicos de Estudo</h2>
              <p className="text-xs text-zinc-400 font-medium">Acompanhe todos os tópicos e altere o status de aprendizado</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Conteúdo</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="text-zinc-400">Filtrar por:</span>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="py-2 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todas as Matérias</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os Status</option>
            <option value="not_started">⏳ Não iniciado</option>
            <option value="in_progress">🔄 Em andamento</option>
            <option value="completed">✅ Concluído</option>
          </select>
        </div>

        {/* Topics Grid / Table */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-3">
          {filteredTopics.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Nenhum conteúdo encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTopics.map((top) => {
                const sub = subjects.find((s) => s.id === top.subjectId);
                return (
                  <div
                    key={top.id}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <select
                        value={top.status}
                        onChange={(e) => setTopicStatus(top.id, e.target.value as TopicStatus)}
                        className="py-1.5 px-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 focus:outline-none"
                      >
                        <option value="not_started">⏳ Não iniciado</option>
                        <option value="in_progress">🔄 Em andamento</option>
                        <option value="completed">✅ Concluído</option>
                      </select>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: sub?.color || '#6366f1' }}
                          />
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            {sub?.name || 'Geral'}
                          </span>
                        </div>
                        <h4 className={`font-bold text-sm ${top.status === 'completed' ? 'line-through text-zinc-500' : 'text-white'}`}>
                          {top.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                      <span className="font-mono text-zinc-400 text-[11px]">
                        {(top.totalTimeMinutes / 60).toFixed(1)}h estudadas
                      </span>

                      <button
                        onClick={() => handleOpenEdit(top)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTopic(top.id)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <TopicModal
          isOpen={isModalOpen}
          topicToEdit={topicToEdit}
          subjects={subjects}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onDelete={deleteTopic}
        />
      </div>
    </MainLayout>
  );
}
