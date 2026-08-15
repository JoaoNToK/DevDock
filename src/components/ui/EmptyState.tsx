'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`p-8 sm:p-12 rounded-3xl theme-surface border border-[var(--border-color)] text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto shadow-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] shadow-inner">
        <Icon className="w-7 h-7 text-[var(--text-primary)]" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">{title}</h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{description}</p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onSecondaryAction && secondaryActionLabel && (
            <button
              onClick={onSecondaryAction}
              className="btn-secondary py-2 px-4 rounded-xl text-xs font-semibold"
            >
              {secondaryActionLabel}
            </button>
          )}

          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className="btn-primary py-2 px-4 rounded-xl text-xs font-bold shadow-md"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
