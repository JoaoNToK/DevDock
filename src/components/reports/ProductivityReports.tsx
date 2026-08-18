import React, { useMemo } from 'react';
import { SessionRecord } from '@/types/analytics';
import { getTodayYMD, formatYMD } from '@/lib/date';
import { Task } from '@/types/task';
import { PlannerActivity } from '@/types/planner';
import { ResponsiveBarChart, CategoryDistributionBar } from '@/components/reports/ResponsiveCharts';
import { Project, ProjectTask } from '@/types/projects';
import { AcademicSubject, AcademicAssignment } from '@/types/academic';
import {
  BarChart2,
  Clock,
  CheckCircle2,
  Target,
  Trophy,
  Flame,
  Calendar,
  RotateCcw,
  SkipForward,
  Download,
  FolderKanban,
  GraduationCap,
  FileText,
} from 'lucide-react';

interface ProductivityReportsProps {
  records: SessionRecord[];
  tasks: Task[];
  activities: PlannerActivity[];
  totalFocusMinutes: number;
  dailyGoal: number;
  projects?: Project[];
  kanbanTasks?: ProjectTask[];
  subjects?: AcademicSubject[];
  assignments?: AcademicAssignment[];
}

export const ProductivityReports: React.FC<ProductivityReportsProps> = ({
  records,
  tasks,
  activities,
  totalFocusMinutes,
  dailyGoal,
  projects = [],
  kanbanTasks = [],
  subjects = [],
  assignments = [],
}) => {
  const todayStr = getTodayYMD();

  // Export to CSV helper
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Data,Hora,Modo,Status,DuracaoMinutos\n';
    records.forEach((r) => {
      csvContent += `${r.dateString},${r.timeString || ''},${r.mode},${r.status || 'COMPLETED'},${r.actualDurationSeconds ? Math.floor(r.actualDurationSeconds / 60) : r.durationMinutes || 0}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `devdock_productivity_report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON helper
  const exportToJSON = () => {
    const dataObj = {
      exportDate: new Date().toISOString(),
      summary: {
        totalFocusMinutes,
        totalFocusHours: (totalFocusMinutes / 60).toFixed(1),
        totalSessions: records.length,
        totalProjects: projects.length,
        totalKanbanTasks: kanbanTasks.length,
        totalSubjects: subjects.length,
        totalAssignments: assignments.length,
      },
      records,
      projects,
      kanbanTasks,
      subjects,
      assignments,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `devdock_full_data_${todayStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate actual duration minutes for any record
  const getRecordActualMinutes = (r: SessionRecord) => {
    if (r.actualDurationSeconds !== undefined) {
      return Math.floor(r.actualDurationSeconds / 60);
    }
    return r.durationMinutes || 0;
  };

  // Today Focus Sessions
  const todayCompletedSessions = useMemo(() => {
    return records.filter(
      (r) =>
        r.dateString === todayStr &&
        (r.mode === 'focus' || r.mode === 'stopwatch') &&
        (r.status === 'COMPLETED' || !r.status)
    );
  }, [records, todayStr]);

  const todayAllSessions = useMemo(() => {
    return records.filter((r) => r.dateString === todayStr && (r.mode === 'focus' || r.mode === 'stopwatch'));
  }, [records, todayStr]);

  const todayFocusMinutes = useMemo(() => {
    return todayAllSessions.reduce((sum, r) => sum + getRecordActualMinutes(r), 0);
  }, [todayAllSessions]);

  const completedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.isCompleted).length;
  }, [tasks]);

  // Last 7 Days Data (Count of completed sessions + total actual minutes)
  const last7DaysData = useMemo(() => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result: { label: string; value: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatYMD(d);
      const dayName = dayNames[d.getDay()];

      const dayCompletedCount = records.filter(
        (r) =>
          r.dateString === dateStr &&
          (r.mode === 'focus' || r.mode === 'stopwatch') &&
          (r.status === 'COMPLETED' || !r.status)
      ).length;

      result.push({ label: dayName, value: dayCompletedCount });
    }
    return result;
  }, [records]);

  // Activity Categories Breakdown
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {
      Estudos: 0,
      Trabalho: 0,
      Pessoal: 0,
      Saúde: 0,
      Outros: 0,
    };

    activities.forEach((a) => {
      if (counts[a.category] !== undefined) {
        counts[a.category] += 1;
      } else {
        counts['Outros'] += 1;
      }
    });

    return [
      { name: 'Estudos', count: counts['Estudos'], color: 'bg-zinc-200 dark:bg-zinc-100' },
      { name: 'Trabalho', count: counts['Trabalho'], color: 'bg-zinc-400' },
      { name: 'Pessoal', count: counts['Pessoal'], color: 'bg-zinc-600' },
      { name: 'Saúde', count: counts['Saúde'], color: 'bg-zinc-700' },
      { name: 'Outros', count: counts['Outros'], color: 'bg-zinc-800' },
    ];
  }, [activities]);

  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Recent session records list (last 10)
  const recentRecords = useMemo(() => {
    return [...records].reverse().slice(0, 10);
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Top Title Banner & Export Buttons */}
      <div className="p-4 sm:p-6 rounded-3xl theme-surface border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl theme-card-elevated border text-primary-theme">
            <BarChart2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-primary-theme">Relatórios de Produtividade & Analytics V2</h2>
            <p className="text-xs text-secondary-theme font-medium">Métricas integradas de Foco, Projetos, Kanban e Faculdade</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="btn-secondary py-2 px-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Exportar registros de foco em CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={exportToJSON}
            className="btn-primary py-2 px-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Exportar todos os dados em JSON"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* CROSS-MODULE DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Projetos & Kanban Summary */}
        <div className="p-5 rounded-3xl theme-surface border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-primary-theme">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              <span>Projetos & Kanban DevDock</span>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">{projects.length} Ativos</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl theme-card-elevated border">
              <span className="text-[11px] text-secondary-theme block">Tarefas no Kanban</span>
              <span className="text-xl font-extrabold text-primary-theme font-mono">{kanbanTasks.length}</span>
            </div>
            <div className="p-3 rounded-2xl theme-card-elevated border">
              <span className="text-[11px] text-secondary-theme block">Concluídas</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {kanbanTasks.filter((t) => t.columnId === 'done' || t.columnId === 'concluido').length}
              </span>
            </div>
          </div>
        </div>

        {/* Faculdade & Acadêmico Summary */}
        <div className="p-5 rounded-3xl theme-surface border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-primary-theme">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Desempenho Acadêmico</span>
            </div>
            <span className="text-xs font-mono text-purple-400 font-bold">{subjects.length} Disciplinas</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl theme-card-elevated border">
              <span className="text-[11px] text-secondary-theme block">Provas / Trabalhos</span>
              <span className="text-xl font-extrabold text-primary-theme font-mono">{assignments.length}</span>
            </div>
            <div className="p-3 rounded-2xl theme-card-elevated border">
              <span className="text-[11px] text-secondary-theme block">Entregues / Feitos</span>
              <span className="text-xl font-extrabold text-purple-400 font-mono">
                {assignments.filter((a) => a.status === 'submitted').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TODAY SUMMARY GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-theme">Hoje</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Pomodoros Concluídos */}
          <div className="p-4 rounded-3xl theme-surface border shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-secondary-theme text-xs font-semibold">
              <Trophy className="w-4 h-4 text-primary-theme" />
              <span>Sessões Concluídas</span>
            </div>
            <p className="text-2xl font-extrabold text-primary-theme font-mono">{todayCompletedSessions.length}</p>
            <p className="text-[10px] text-secondary-theme">Sessões completas (00:00)</p>
          </div>

          {/* Tempo Focado Hoje */}
          <div className="p-4 rounded-3xl theme-surface border shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-secondary-theme text-xs font-semibold">
              <Clock className="w-4 h-4 text-primary-theme" />
              <span>Tempo Real Focado</span>
            </div>
            <p className="text-2xl font-extrabold text-primary-theme font-mono">{todayFocusMinutes} min</p>
            <p className="text-[10px] text-secondary-theme">{(todayFocusMinutes / 60).toFixed(1)} horas reais hoje</p>
          </div>

          {/* Tarefas Concluídas */}
          <div className="p-4 rounded-3xl theme-surface border shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-secondary-theme text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-primary-theme" />
              <span>Tarefas</span>
            </div>
            <p className="text-2xl font-extrabold text-primary-theme font-mono">{completedTasksCount}</p>
            <p className="text-[10px] text-secondary-theme">Total concluídas</p>
          </div>

          {/* Meta Diária */}
          <div className="p-4 rounded-3xl theme-surface border shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-secondary-theme text-xs font-semibold">
              <Target className="w-4 h-4 text-primary-theme" />
              <span>Meta Diária</span>
            </div>
            <p className="text-2xl font-extrabold text-primary-theme font-mono">
              {todayCompletedSessions.length} / {dailyGoal}
            </p>
            <p className="text-[10px] text-secondary-theme">
              {Math.min(100, Math.round((todayCompletedSessions.length / dailyGoal) * 100))}% concluído
            </p>
          </div>
        </div>
      </div>

      {/* WEEKLY & MONTHLY CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Pomodoros Chart */}
        <div className="p-6 rounded-3xl theme-surface border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-primary-theme">Sessões Concluídas nos Últimos 7 Dias</h4>
              <p className="text-xs text-secondary-theme">Distribuição de pomodoros concluídos por dia</p>
            </div>
            <Flame className="w-5 h-5 text-secondary-theme" />
          </div>

          <ResponsiveBarChart data={last7DaysData} accentColor="bg-[var(--text-primary)]" />
        </div>

        {/* Activity Category Breakdown */}
        <div className="p-6 rounded-3xl theme-surface border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-primary-theme">Distribuição das Atividades</h4>
              <p className="text-xs text-secondary-theme">Onde você está gastando seu tempo de planejamento</p>
            </div>
            <Calendar className="w-5 h-5 text-secondary-theme" />
          </div>

          <CategoryDistributionBar categories={categoryStats} />
        </div>
      </div>

      {/* RECENT HISTORICAL SESSIONS */}
      <div className="p-6 rounded-3xl theme-surface border shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-primary-theme uppercase tracking-wider">Histórico Recente de Sessões</h4>
        {recentRecords.length === 0 ? (
          <p className="text-xs text-secondary-theme py-4">Nenhuma sessão registrada ainda.</p>
        ) : (
          <div className="space-y-2">
            {recentRecords.map((r) => {
              const actualMins = getRecordActualMinutes(r);
              const statusLabel = r.status === 'COMPLETED' ? 'Concluído' : r.status === 'SKIPPED' ? 'Pulado' : r.status === 'RESET' ? 'Reiniciado' : 'Concluído';
              const statusColor = 'theme-card-elevated text-primary-theme border';

              return (
                <div key={r.id} className="p-3 rounded-2xl theme-card-elevated border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {r.status === 'COMPLETED' || !r.status ? (
                      <CheckCircle2 className="w-4 h-4 text-primary-theme" />
                    ) : r.status === 'SKIPPED' ? (
                      <SkipForward className="w-4 h-4 text-secondary-theme" />
                    ) : (
                      <RotateCcw className="w-4 h-4 text-tertiary-theme" />
                    )}
                    <div>
                      <span className="font-bold text-primary-theme capitalize block">{r.mode === 'focus' ? 'Foco' : r.mode}</span>
                      <span className="text-[10px] text-secondary-theme">{r.dateString} às {r.timeString}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-primary-theme">{actualMins} min reais</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MONTHLY SUMMARY CARD */}
      <div className="p-6 rounded-3xl theme-surface border shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-secondary-theme uppercase tracking-wider">Resumo Geral da Conta</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl theme-card-elevated border">
            <span className="text-xs text-secondary-theme font-semibold block">Total de Horas Reais Focadas</span>
            <span className="text-2xl font-extrabold font-mono text-primary-theme mt-1 block">{totalFocusHours}h</span>
            <span className="text-[10px] text-secondary-theme">{totalFocusMinutes} minutos reais acumulados</span>
          </div>

          <div className="p-4 rounded-2xl theme-card-elevated border">
            <span className="text-xs text-secondary-theme font-semibold block">Total de Sessões Registradas</span>
            <span className="text-2xl font-extrabold font-mono text-primary-theme mt-1 block">{records.length}</span>
            <span className="text-[10px] text-secondary-theme">No histórico de foco</span>
          </div>

          <div className="p-4 rounded-2xl theme-card-elevated border">
            <span className="text-xs text-secondary-theme font-semibold block">Tarefas no Sistema</span>
            <span className="text-2xl font-extrabold font-mono text-primary-theme mt-1 block">{tasks.length}</span>
            <span className="text-[10px] text-secondary-theme">{completedTasksCount} concluídas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
