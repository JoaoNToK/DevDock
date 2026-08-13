'use client';

import React from 'react';
import { ProductivityDayData } from '@/types/analytics';

interface ProductivityChartProps {
  data: ProductivityDayData[];
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({ data }) => {
  // Find maximum minutes for scaling bar heights
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 60); // minimum scale of 60 mins

  return (
    <div className="w-full p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Produtividade nos últimos 7 dias
        </h4>
        <span className="text-[11px] text-zinc-500 font-mono">minutos focados</span>
      </div>

      <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1">
        {data.map((day, idx) => {
          const heightPercent = maxMinutes > 0 ? Math.max(8, (day.minutes / maxMinutes) * 100) : 8;
          const isToday = day.isToday;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[10px] font-mono py-1 px-1.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap border border-zinc-700 mb-1 z-10">
                {day.minutes}m ({day.count} sessões)
              </div>

              {/* Bar */}
              <div className="w-full max-w-[28px] bg-zinc-800/60 rounded-t-lg relative flex items-end overflow-hidden h-full">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isToday
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                      : day.minutes > 0
                      ? 'bg-gradient-to-t from-indigo-900 to-indigo-600/80 hover:from-indigo-700 hover:to-indigo-500'
                      : 'bg-zinc-800/40'
                  }`}
                />
              </div>

              {/* Day Label */}
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isToday ? 'text-indigo-400 font-bold' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              >
                {day.dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
