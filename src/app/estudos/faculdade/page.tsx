'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAcademic } from '@/hooks/useAcademic';
import { CourseModal } from '@/components/academic/CourseModal';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Pencil,
  ArrowRight,
  Plus,
} from 'lucide-react';

export default function FaculdadeDashboardPage() {
  const {
    isMounted,
    course,
    semesters,
    subjects,
    assignments,
    updateCourse,
  } = useAcademic();

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const activeSemester = semesters.find((s) => s.isCurrent) || semesters[0];
  const activeSubjects = subjects.filter((s) => !activeSemester || s.semesterId === activeSemester.id);
  const pendingAssignments = assignments.filter((a) => a.status !== 'submitted');
  const overdueAssignments = assignments.filter((a) => a.status === 'overdue');
  const upcomingExams = assignments.filter((a) => a.type === 'prova' && a.status !== 'submitted');

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-900 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vida Acadêmica &amp; Faculdade</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {course.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {course.institution} • <span className="text-emerald-400 font-bold">{course.currentSemesterName} ({course.currentPeriod})</span>
            </p>
          </div>

          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 z-10"
          >
            <Pencil className="w-4 h-4" />
            <span>Editar Meu Curso</span>
          </button>
        </div>

        {/* Overdue Warning Alert */}
        {overdueAssignments.length > 0 && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <span className="font-bold">Atenção! Você possui {overdueAssignments.length} entrega(s) com prazo vencido!</span>
                <p className="text-[11px] text-red-400/80">Confira a seção de Trabalhos &amp; Entregas para regularizar suas etapas.</p>
              </div>
            </div>
            <Link
              href="/estudos/faculdade/trabalhos"
              className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all flex items-center gap-1"
            >
              <span>Ver Pendências</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>Disciplinas Ativas</span>
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{activeSubjects.length}</p>
            <p className="text-[10px] text-zinc-500">Matérias no semestre atual</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <Calendar className="w-4 h-4" />
              <span>Próximas Provas</span>
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{upcomingExams.length}</p>
            <p className="text-[10px] text-zinc-500">Avaliações agendadas</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <FileText className="w-4 h-4" />
              <span>Trabalhos Pendentes</span>
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{pendingAssignments.length}</p>
            <p className="text-[10px] text-zinc-500">Entregas em andamento</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
              <Clock className="w-4 h-4" />
              <span>Semestre Vigente</span>
            </div>
            <p className="text-2xl font-extrabold text-white font-mono truncate">{course.currentPeriod}</p>
            <p className="text-[10px] text-zinc-500">{course.currentSemesterName}</p>
          </div>
        </div>

        {/* 2 Column Main Section: Disciplinas vs Próximas Avaliações */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Disciplinas do Semestre (Left) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Disciplinas do Semestre ({activeSubjects.length})</span>
                </h3>
                <Link
                  href="/estudos/faculdade/disciplinas"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Ver todas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {activeSubjects.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">Nenhuma disciplina cadastrada neste semestre.</p>
              ) : (
                <div className="space-y-3">
                  {activeSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                            {sub.code && (
                              <span className="px-2 py-0.5 rounded bg-zinc-900 text-[10px] font-mono text-zinc-400">
                                {sub.code}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {sub.professor || 'Prof. a definir'} • {sub.classDay || ''} ({sub.classTime || ''})
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-emerald-400 font-bold">{sub.workloadHours}h</span>
                        <p className="text-[10px] text-zinc-500">{sub.classroom || 'Sala --'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Próximos Eventos & Avaliações (Right) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Próximas Avaliações &amp; Entregas</span>
                </h3>
                <Link
                  href="/estudos/faculdade/avaliacoes"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Ver Calendário</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {pendingAssignments.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">Nenhuma prova ou trabalho pendente!</p>
              ) : (
                <div className="space-y-3">
                  {pendingAssignments.slice(0, 4).map((assig) => {
                    const sub = subjects.find((s) => s.id === assig.subjectId);
                    return (
                      <div
                        key={assig.id}
                        className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                          assig.status === 'overdue'
                            ? 'bg-red-950/20 border-red-500/40 text-red-300'
                            : 'bg-zinc-950 border-zinc-800/80 text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate max-w-[200px]">{assig.title}</span>
                          <span className="font-mono text-[11px] text-emerald-400">{assig.dueDate}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ backgroundColor: sub?.color || '#6366f1' }}
                          >
                            {sub?.name || 'Geral'}
                          </span>
                          <span className="text-zinc-400">{assig.dueTime || ''} {assig.location ? `• ${assig.location}` : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        <CourseModal
          isOpen={isCourseModalOpen}
          course={course}
          onClose={() => setIsCourseModalOpen(false)}
          onSave={updateCourse}
        />
      </div>
    </MainLayout>
  );
}
