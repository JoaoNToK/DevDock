'use client';

import React from 'react';

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 rounded-3xl theme-surface border border-[var(--border-color)] space-y-4 animate-pulse ${className}`}>
    <div className="flex items-center justify-between">
      <div className="h-4 w-32 bg-[var(--border-color)] rounded-lg" />
      <div className="h-4 w-12 bg-[var(--border-color)] rounded-lg" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full bg-[var(--border-color)] rounded-lg" />
      <div className="h-3 w-4/5 bg-[var(--border-color)] rounded-lg" />
    </div>
    <div className="h-8 w-24 bg-[var(--border-color)] rounded-xl" />
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] h-44" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="lg:col-span-5 space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  </div>
);

export const KanbanSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
    {[1, 2, 3, 4].map((col) => (
      <div key={col} className="p-4 rounded-3xl theme-surface border border-[var(--border-color)] space-y-4 min-h-[500px]">
        <div className="h-5 w-28 bg-[var(--border-color)] rounded-lg" />
        <div className="space-y-3">
          <div className="h-28 bg-[var(--border-color)] rounded-2xl" />
          <div className="h-28 bg-[var(--border-color)] rounded-2xl" />
          <div className="h-28 bg-[var(--border-color)] rounded-2xl" />
        </div>
      </div>
    ))}
  </div>
);
