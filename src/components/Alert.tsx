/**
 * Alert / callout component for inline feedback.
 */

'use client';

import React from 'react';

type AlertVariant = 'error' | 'warning' | 'info' | 'success';

interface AlertProps {
  variant?: AlertVariant;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

const VARIANT_STYLES: Record<AlertVariant, { container: string; title: string; text: string }> = {
  error: {
    container: 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30',
    title: 'text-red-900 dark:text-red-100',
    text: 'text-red-900/80 dark:text-red-100/80',
  },
  warning: {
    container: 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30',
    title: 'text-amber-900 dark:text-amber-100',
    text: 'text-amber-900/80 dark:text-amber-100/80',
  },
  info: {
    container: 'border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/30',
    title: 'text-blue-900 dark:text-blue-100',
    text: 'text-blue-900/80 dark:text-blue-100/80',
  },
  success: {
    container: 'border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/30',
    title: 'text-green-900 dark:text-green-100',
    text: 'text-green-900/80 dark:text-green-100/80',
  },
};

export function Alert({
  variant = 'info',
  title,
  description,
  actionLabel,
  onAction,
  onDismiss,
}: AlertProps): React.ReactElement {
  const styles = VARIANT_STYLES[variant];
  const hasAction = actionLabel != null && actionLabel.trim() !== '' && onAction != null;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 ${styles.container}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${styles.title}`}>{title}</p>
          {description && <p className={`mt-1 text-sm ${styles.text}`}>{description}</p>}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {hasAction && (
            <button
              type="button"
              onClick={onAction}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800"
            >
              {actionLabel}
            </button>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="rounded-md px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-zinc-200 dark:hover:bg-zinc-900/50"
            >
              x
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
