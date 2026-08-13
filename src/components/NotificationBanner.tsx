'use client';

import React from 'react';
import { TimerMode } from '@/hooks/usePomodoroTimer';
import { BellRing, ArrowRight, X } from 'lucide-react';

interface NotificationBannerProps {
  mode: TimerMode;
  onDismiss: () => void;
  onSelectNextMode: (nextMode: TimerMode) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  mode,
  onDismiss,
  onSelectNextMode,
}) => {
  const getMessage = () => {
    switch (mode) {
      case 'focus':
        return {
          title: 'Tempo de Foco concluído!',
          desc: 'Excelente trabalho! Agora é hora de descansar com uma pausa curta.',
          suggestedMode: 'shortBreak' as TimerMode,
          suggestedLabel: 'Iniciar Pausa Curta',
        };
      case 'shortBreak':
        return {
          title: 'Pausa Curta terminada!',
          desc: 'Hora de voltar ao trabalho com energia total.',
          suggestedMode: 'focus' as TimerMode,
          suggestedLabel: 'Iniciar Foco',
        };
      case 'longBreak':
        return {
          title: 'Pausa Longa terminada!',
          desc: 'Seu ciclo de descanso acabou. Vamos para mais uma sessão de foco?',
          suggestedMode: 'focus' as TimerMode,
          suggestedLabel: 'Iniciar Foco',
        };
      case 'stopwatch':
        return {
          title: 'Sessão de Cronômetro finalizada!',
          desc: 'Tempo acumulado com sucesso no seu histórico de foco.',
          suggestedMode: 'focus' as TimerMode,
          suggestedLabel: 'Iniciar Foco',
        };
    }
  };

  const info = getMessage();

  return (
    <div className="w-full max-w-md my-4 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 border border-indigo-500 animate-ring-bounce">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
            <BellRing className="w-5 h-5 text-white animate-bounce" />
          </div>
          <div>
            <h3 className="font-bold text-base">{info.title}</h3>
            <p className="text-xs text-indigo-100 mt-0.5">{info.desc}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-indigo-500/60 flex justify-end">
        <button
          onClick={() => onSelectNextMode(info.suggestedMode)}
          className="py-1.5 px-3.5 rounded-xl bg-white text-indigo-700 font-semibold text-xs shadow-md hover:bg-indigo-50 transition-all flex items-center gap-1.5"
        >
          <span>{info.suggestedLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
