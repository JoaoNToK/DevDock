'use client';

import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  accentColor?: string;
}

export const ResponsiveBarChart: React.FC<BarChartProps> = ({
  data,
  accentColor = 'bg-[var(--text-primary)]',
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full space-y-2">
      <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2 border-b border-[var(--border-color)]">
        {data.map((item, idx) => {
          const heightPercent = Math.max(8, Math.round((item.value / maxValue) * 100));
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
              <span className="text-[10px] font-mono text-secondary-theme opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}
              </span>
              <div
                className={`w-full rounded-t-xl transition-all duration-500 ${accentColor} hover:opacity-80`}
                style={{ height: `${heightPercent}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-2 px-2 text-[10px] text-tertiary-theme font-semibold uppercase">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 text-center truncate">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

interface DistributionProps {
  categories: { name: string; count: number; color: string }[];
}

export const CategoryDistributionBar: React.FC<DistributionProps> = ({ categories }) => {
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  if (total === 0) {
    return (
      <div className="p-4 text-center text-xs text-tertiary-theme">
        Nenhuma atividade categorizada registrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Horizontal Stacked Bar */}
      <div className="h-3 w-full rounded-full theme-card flex overflow-hidden p-0.5 border">
        {categories.map((c, idx) => {
          if (c.count === 0) return null;
          const pct = Math.round((c.count / total) * 100);
          return (
            <div
              key={idx}
              className={`h-full ${c.color} first:rounded-l-full last:rounded-r-full transition-all`}
              style={{ width: `${pct}%` }}
              title={`${c.name}: ${c.count} (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((c, idx) => {
          const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
              <span className="text-secondary-theme font-medium truncate">{c.name}</span>
              <span className="font-mono text-tertiary-theme font-bold ml-auto">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
