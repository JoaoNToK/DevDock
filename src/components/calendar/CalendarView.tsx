'use client';

import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { getTodayYMD, formatYMD, formatDateBR } from '@/lib/date';
import { EventModal } from '@/components/calendar/EventModal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Tag,
} from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => CalendarEvent;
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
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
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  const todayStr = getTodayYMD();

  // Period Navigation handlers
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

    // Next month padding to fill 35 or 42 cells
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

  const handleOpenAddModal = (dateStr?: string) => {
    setEventToEdit(null);
    setSelectedDateStr(dateStr || formatYMD(currentDate));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: CalendarEvent) => {
    setEventToEdit(evt);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    if (eventToEdit) {
      onUpdateEvent(eventToEdit.id, data);
    } else {
      onAddEvent(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
        {/* Period Navigation */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              {viewMode === 'month' ? 'Visão Mensal' : viewMode === 'week' ? 'Visão Semanal' : 'Visão Diária'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-xl text-xs font-bold text-indigo-400 hover:bg-zinc-800 transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-semibold">
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`py-1 px-3 rounded-xl transition-all capitalize ${
                  viewMode === mode
                    ? 'bg-zinc-800 text-indigo-400 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>

          {/* Create Event Button */}
          <button
            onClick={() => handleOpenAddModal()}
            className="py-2 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5 ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-3">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-zinc-400 pb-2 border-b border-zinc-800">
            {WEEK_DAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthGridDays.map(({ date, dateStr, isCurrentMonth }, idx) => {
              const isToday = dateStr === todayStr;
              const dayEvents = events.filter((e) => e.dateString === dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenAddModal(dateStr)}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                    isToday
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                      : isCurrentMonth
                      ? 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                      : 'bg-zinc-950/20 border-zinc-900 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-md'
                          : isCurrentMonth
                          ? 'text-zinc-300'
                          : 'text-zinc-600'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Event Badges */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-16">
                    {dayEvents.slice(0, 3).map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(evt);
                        }}
                        className={`py-1 px-1.5 rounded-lg border text-[10px] font-semibold truncate transition-all hover:scale-[1.02] ${
                          CATEGORY_COLORS[evt.category] || CATEGORY_COLORS['Outros']
                        }`}
                      >
                        {evt.startTime} {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-zinc-500 font-bold block px-1">
                        +{dayEvents.length - 3} mais
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
        <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {weekDays.map(({ date, dateStr }, idx) => {
              const isToday = dateStr === todayStr;
              const dayEvents = events.filter((e) => e.dateString === dateStr);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex flex-col space-y-3 min-h-[300px] ${
                    isToday
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md'
                      : 'bg-zinc-950/60 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div>
                      <p className="text-[11px] font-bold text-zinc-400 uppercase">
                        {WEEK_DAYS[date.getDay()]}
                      </p>
                      <p className={`text-base font-extrabold ${isToday ? 'text-indigo-400' : 'text-white'}`}>
                        {date.getDate()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenAddModal(dateStr)}
                      className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* List of events */}
                  <div className="space-y-2 flex-1">
                    {dayEvents.length === 0 ? (
                      <span className="text-[11px] text-zinc-600 block pt-4 text-center">
                        Sem eventos
                      </span>
                    ) : (
                      dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => handleOpenEditModal(evt)}
                          className={`p-2.5 rounded-xl border text-xs space-y-1 cursor-pointer transition-all hover:scale-[1.02] ${
                            CATEGORY_COLORS[evt.category] || CATEGORY_COLORS['Outros']
                          }`}
                        >
                          <p className="font-bold truncate">{evt.title}</p>
                          <div className="flex items-center gap-1 text-[10px] opacity-80">
                            <Clock className="w-3 h-3" />
                            <span>{evt.startTime} - {evt.endTime}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-lg font-bold text-white">
                {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-xs text-zinc-400">Compromissos agendados para este dia</p>
            </div>

            <button
              onClick={() => handleOpenAddModal(formatYMD(currentDate))}
              className="py-2 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Compromisso</span>
            </button>
          </div>

          {/* Timeline Schedule for Day */}
          <div className="space-y-3 pt-2">
            {events.filter((e) => e.dateString === formatYMD(currentDate)).length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Nenhum compromisso agendado para hoje. Clique no botão acima para adicionar!
              </div>
            ) : (
              events
                .filter((e) => e.dateString === formatYMD(currentDate))
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => handleOpenEditModal(evt)}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${CATEGORY_COLORS[evt.category] || CATEGORY_COLORS['Outros']}`}>
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                          {evt.title}
                        </h4>
                        {evt.description && (
                          <p className="text-xs text-zinc-400 mt-0.5">{evt.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{evt.startTime} - {evt.endTime}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Modal for Creating & Editing Events */}
      <EventModal
        isOpen={isModalOpen}
        eventToEdit={eventToEdit}
        defaultDate={selectedDateStr}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={onDeleteEvent}
      />
    </div>
  );
};
