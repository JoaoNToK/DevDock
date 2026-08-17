'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CalendarEvent } from '@/types/calendar';
import { PlannerActivity } from '@/types/planner';
import { ProjectTask } from '@/types/projects';
import { AcademicAssignment } from '@/types/academic';
import { getTodayYMD, formatYMD } from '@/lib/date';
import { EventModal } from '@/components/calendar/EventModal';
import { ActivityModal } from '@/components/planning/ActivityModal';
import { BulkDeleteModal } from '@/components/calendar/BulkDeleteModal';
import { signIn } from 'next-auth/react';
import { fetchGoogleCalendarEventsAction } from '@/app/actions/googleCalendarActions';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  CheckSquare,
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  Sun,
  Trash2,
  Repeat,
} from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  activities?: PlannerActivity[];
  projectTasks?: ProjectTask[];
  academicAssignments?: AcademicAssignment[];
  onAddEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => CalendarEvent;
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onBulkDelete?: (criteria: { beforeDate?: string; category?: string }) => void;
  onAddActivity?: (actData: Omit<PlannerActivity, 'id' | 'createdAt'>) => PlannerActivity;
  onUpdateActivity?: (id: string, updates: Partial<PlannerActivity>) => void;
  onToggleActivityComplete?: (id: string) => void;
  onDeleteActivity?: (id: string) => void;
}

type ViewMode = 'month' | 'week' | 'day';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CATEGORY_COLORS: Record<string, string> = {
  Estudos: 'theme-card-elevated text-primary-theme border',
  Trabalho: 'theme-card-elevated text-primary-theme border',
  Pessoal: 'theme-card-elevated text-primary-theme border',
  Saúde: 'theme-card-elevated text-primary-theme border',
  Outros: 'theme-card-elevated text-primary-theme border',
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  activities = [],
  projectTasks = [],
  academicAssignments = [],
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onBulkDelete,
  onAddActivity,
  onUpdateActivity,
  onToggleActivityComplete,
  onDeleteActivity,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = (searchParams.get('view') as ViewMode) || 'month';

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

  useEffect(() => {
    const view = searchParams.get('view') as ViewMode;
    if (view && (view === 'month' || view === 'week' || view === 'day')) {
      setViewMode(view);
    }
  }, [searchParams]);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<PlannerActivity | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  const todayStr = getTodayYMD();

  // Expand recurring events for rendering across dates
  const effectiveEvents = useMemo(() => {
    const expanded: CalendarEvent[] = [];

    for (const evt of events) {
      expanded.push(evt);

      if (evt.recurrence && evt.recurrence !== 'none') {
        const baseDate = new Date(evt.dateString + 'T00:00:00');
        const maxOccurrences = 52;
        const endDate = evt.recurrenceEndDate ? new Date(evt.recurrenceEndDate + 'T23:59:59') : null;

        for (let i = 1; i <= maxOccurrences; i++) {
          const nextDate = new Date(baseDate);
          if (evt.recurrence === 'daily') {
            nextDate.setDate(nextDate.getDate() + i);
          } else if (evt.recurrence === 'weekly') {
            nextDate.setDate(nextDate.getDate() + i * 7);
          } else if (evt.recurrence === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + i);
          }

          if (endDate && nextDate > endDate) break;

          const nextYMD = formatYMD(nextDate);
          expanded.push({
            ...evt,
            id: `${evt.id}-rec-${i}`,
            dateString: nextYMD,
          });
        }
      }
    }

    return expanded;
  }, [events]);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Grid Days calculation
  const monthGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push({ date: d, dateStr: formatYMD(d), isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      days.push({ date: d, dateStr: formatYMD(d), isCurrentMonth: true });
    }

    // Next month padding to fill 42 cells
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, dateStr: formatYMD(d), isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Week Days calculation
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const days: { date: Date; dateStr: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push({ date: d, dateStr: formatYMD(d) });
    }
    return days;
  }, [currentDate]);

  const handleOpenAddEvent = (dateStr?: string) => {
    setEventToEdit(null);
    setSelectedDateStr(dateStr || formatYMD(currentDate));
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: CalendarEvent) => {
    setEventToEdit(evt);
    setIsEventModalOpen(true);
  };

  const handleOpenAddActivity = (dateStr?: string) => {
    setActivityToEdit(null);
    setSelectedDateStr(dateStr || formatYMD(currentDate));
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = (data: Omit<PlannerActivity, 'id' | 'createdAt'>) => {
    if (activityToEdit && onUpdateActivity) {
      onUpdateActivity(activityToEdit.id, data);
    } else if (onAddActivity) {
      onAddActivity(data);
    }
  };

  const handleSaveEvent = (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    if (eventToEdit) {
      onUpdateEvent(eventToEdit.id, data);
    } else {
      onAddEvent(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl theme-card-elevated border text-primary-theme">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-primary-theme">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-xs text-secondary-theme font-medium">
              {viewMode === 'month' ? 'Visão Mensal' : viewMode === 'week' ? 'Visão Semanal' : 'Visão Diária'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1 p-1 rounded-2xl theme-surface border">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl text-secondary-theme hover:text-primary-theme hover:bg-zinc-800 transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-xl text-xs font-bold text-primary-theme hover:bg-zinc-800 transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl text-secondary-theme hover:text-primary-theme hover:bg-zinc-800 transition-colors"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl theme-surface border text-xs font-semibold">
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  router.push(`/calendario?view=${mode}`);
                }}
                className={`py-1 px-3 rounded-xl transition-all capitalize ${
                  viewMode === mode
                    ? 'theme-card-elevated text-primary-theme font-bold border shadow-sm'
                    : 'text-secondary-theme hover:text-primary-theme'
                }`}
              >
                {mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>

          {/* Create Buttons */}
          <div className="flex flex-wrap items-center gap-2 ml-auto sm:ml-0">
            {onBulkDelete && (
              <button
                onClick={() => setIsBulkDeleteOpen(true)}
                className="py-2 px-3 rounded-2xl theme-surface border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-500/10 transition-all flex items-center gap-1.5"
                title="Excluir eventos antigos ou por categoria em lote"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpeza</span>
              </button>
            )}

            <button
              disabled={isSyncingGoogle}
              onClick={async () => {
                setIsSyncingGoogle(true);
                try {
                  const res = await fetchGoogleCalendarEventsAction();
                  if (!res.success && res.reason === 'google_auth_required') {
                    const wantLogin = confirm(
                      '🔑 Para sincronizar o Google Calendar, é necessário fazer login com sua Conta do Google.\n\nDeseja conectar sua conta do Google agora?'
                    );
                    if (wantLogin) {
                      signIn('google');
                    }
                  } else if (res.success) {
                    alert(`✨ Sincronização concluída com sucesso!\n\n📅 ${res.events.length} compromisso(s) sincronizado(s) diretamente da sua conta Google.`);
                  } else {
                    alert('⚠️ Não foi possível comunicar com a API do Google Calendar no momento. Verifique sua conexão.');
                  }
                } catch (err) {
                  alert('❌ Ocorreu um erro ao sincronizar com o Google Calendar.');
                } finally {
                  setIsSyncingGoogle(false);
                }
              }}
              className="py-2 px-3 rounded-2xl theme-surface border border-blue-500/40 text-blue-400 font-bold text-xs hover:bg-blue-500/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Sincronizar eventos com a API do Google Calendar"
            >
              <span>{isSyncingGoogle ? '⟳ Sincronizando...' : 'Google Calendar'}</span>
            </button>

            <button
              onClick={() => handleOpenAddActivity()}
              className="py-2 px-3 rounded-2xl theme-card-elevated border text-primary-theme font-bold text-xs hover:bg-zinc-800 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Atividade</span>
            </button>
            <button
              onClick={() => handleOpenAddEvent()}
              className="py-2 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Evento</span>
            </button>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-3">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-secondary-theme pb-2 border-b">
            {WEEK_DAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthGridDays.map(({ date, dateStr, isCurrentMonth }, idx) => {
              const isToday = dateStr === todayStr;
              const dayEvents = effectiveEvents.filter((e) => e.dateString === dateStr);
              const dayActs = activities.filter((a) => a.dateString === dateStr);
              const dayTasks = projectTasks.filter((t) => t.dueDate === dateStr);
              const dayAss = academicAssignments.filter((a) => a.dueDate === dateStr);

              const totalItemsCount = dayEvents.length + dayActs.length + dayTasks.length + dayAss.length;

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenAddEvent(dateStr)}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                    isToday
                      ? 'theme-card-elevated border-primary-theme shadow-md'
                      : isCurrentMonth
                      ? 'theme-surface hover:border-zinc-700'
                      : 'opacity-40 text-tertiary-theme'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-primary-theme'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddEvent(dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-zinc-800 transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-16">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditEvent(evt);
                        }}
                        className="py-0.5 px-1.5 rounded-lg theme-card-elevated border text-[10px] font-semibold truncate hover:scale-[1.02] transition-all"
                      >
                        {evt.startTime} {evt.title}
                      </div>
                    ))}

                    {dayActs.slice(0, 1).map((act) => (
                      <div
                        key={act.id}
                        className="py-0.5 px-1.5 rounded-lg theme-card-elevated border text-[10px] font-semibold truncate flex items-center gap-1 text-emerald-400"
                      >
                        <Sun className="w-2.5 h-2.5" />
                        <span className="truncate">{act.title}</span>
                      </div>
                    ))}

                    {dayTasks.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className="py-0.5 px-1.5 rounded-lg theme-card-elevated border text-[10px] font-semibold truncate flex items-center gap-1 text-cyan-400"
                      >
                        <CheckSquare className="w-2.5 h-2.5" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}

                    {totalItemsCount > 3 && (
                      <span className="text-[10px] text-secondary-theme font-bold block px-1">
                        +{totalItemsCount - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {weekDays.map(({ date, dateStr }, idx) => {
              const isToday = dateStr === todayStr;
              const dayEvents = effectiveEvents.filter((e) => e.dateString === dateStr);
              const dayActs = activities.filter((a) => a.dateString === dateStr);
              const dayTasks = projectTasks.filter((t) => t.dueDate === dateStr);

              return (
                <div
                  key={dateStr}
                  className={`p-3 rounded-2xl border flex flex-col min-h-[300px] transition-all ${
                    isToday ? 'theme-surface border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20' : 'theme-card-elevated border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-bold text-secondary-theme">
                      {WEEK_DAYS[date.getDay()]}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-primary-theme'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="flex-1 pt-2 space-y-2 overflow-y-auto">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => handleOpenEditEvent(evt)}
                        className="p-2.5 rounded-xl theme-surface border hover:border-zinc-700 transition-all cursor-pointer text-xs space-y-1 group"
                      >
                        <div className="flex items-center justify-between font-bold text-primary-theme group-hover:text-indigo-400">
                          <span className="truncate">{evt.title}</span>
                          {evt.recurrence && evt.recurrence !== 'none' && (
                            <Repeat className="w-3 h-3 text-indigo-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-secondary-theme font-mono">
                          {evt.startTime} - {evt.endTime}
                        </p>
                      </div>
                    ))}

                    {dayActs.map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-xl theme-card-elevated border text-xs space-y-1 text-emerald-400"
                      >
                        <div className="flex items-center gap-1">
                          <Sun className="w-3 h-3" />
                          <span className="font-bold truncate">{act.title}</span>
                        </div>
                        {act.startTime && (
                          <p className="text-[10px] text-secondary-theme">{act.startTime}</p>
                        )}
                      </div>
                    ))}

                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl theme-card-elevated border text-xs space-y-1 text-cyan-400"
                      >
                        <div className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3" />
                          <span className="font-bold truncate">{t.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b">
            <div>
              <h3 className="text-lg font-bold text-primary-theme">
                {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-xs text-secondary-theme">Visão detalhada de atividades, eventos e tarefas para hoje</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddActivity(formatYMD(currentDate))}
                className="py-2 px-3 rounded-2xl theme-card-elevated border text-primary-theme font-bold text-xs hover:bg-zinc-800 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Atividade do Dia</span>
              </button>
              <button
                onClick={() => handleOpenAddEvent(formatYMD(currentDate))}
                className="py-2 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Compromisso</span>
              </button>
            </div>
          </div>

          {/* Combined Schedule */}
          <div className="space-y-3">
            {effectiveEvents.filter((e) => e.dateString === formatYMD(currentDate)).map((evt) => (
              <div
                key={evt.id}
                onClick={() => handleOpenEditEvent(evt)}
                className="p-4 rounded-2xl theme-surface border hover:border-zinc-700 transition-all flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl theme-card-elevated border text-primary-theme">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-primary-theme group-hover:text-indigo-400 transition-colors">
                        {evt.title}
                      </h4>
                      {evt.recurrence && evt.recurrence !== 'none' && (
                        <span className="py-0.5 px-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 flex items-center gap-1">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>{evt.recurrence === 'daily' ? 'Diário' : evt.recurrence === 'weekly' ? 'Semanal' : 'Mensal'}</span>
                        </span>
                      )}
                    </div>
                    {evt.description && (
                      <p className="text-xs text-secondary-theme mt-0.5">{evt.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-secondary-theme px-3 py-1.5 rounded-xl theme-card-elevated border">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{evt.startTime} - {evt.endTime}</span>
                </div>
              </div>
            ))}

            {activities.filter((a) => a.dateString === formatYMD(currentDate)).map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl theme-surface border flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleActivityComplete && onToggleActivityComplete(act.id)}
                    className="text-emerald-400 hover:scale-110 transition-transform"
                  >
                    {act.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <div>
                    <h4 className={`font-bold text-sm ${act.isCompleted ? 'line-through text-tertiary-theme' : 'text-primary-theme'}`}>
                      {act.title}
                    </h4>
                    {act.description && <p className="text-xs text-secondary-theme mt-0.5">{act.description}</p>}
                  </div>
                </div>

                <button
                  onClick={() => router.push('/pomodoro')}
                  className="py-1.5 px-3 rounded-xl theme-card-elevated border text-xs font-bold text-emerald-400 flex items-center gap-1 hover:bg-zinc-800 transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Iniciar Foco</span>
                </button>
              </div>
            ))}

            {projectTasks.filter((t) => t.dueDate === formatYMD(currentDate)).map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl theme-surface border flex items-center justify-between gap-4 text-cyan-400"
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold text-sm text-primary-theme">{t.title}</h4>
                    {t.description && <p className="text-xs text-secondary-theme mt-0.5">{t.description}</p>}
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-xl theme-card-elevated border text-cyan-400">
                  Prazo Hoje
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        eventToEdit={eventToEdit}
        defaultDate={selectedDateStr}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={onDeleteEvent}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        activityToEdit={activityToEdit}
        defaultDate={selectedDateStr}
        onClose={() => setIsActivityModalOpen(false)}
        onSave={handleSaveActivity}
        onDelete={onDeleteActivity}
      />

      <BulkDeleteModal
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirmBulkDelete={(criteria) => {
          if (onBulkDelete) {
            onBulkDelete(criteria);
            alert('🧹 Limpeza em lote realizada com sucesso!');
          }
        }}
      />
    </div>
  );
};
