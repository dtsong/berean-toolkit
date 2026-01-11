/**
 * SermonOutline component
 * Displays generated sermon outline with main points, themes, and cross-references
 */

'use client';

import type { SermonOutline as SermonOutlineType } from '@/types';

interface SermonOutlineProps {
  outline: SermonOutlineType | null;
  loading?: boolean;
}

export function SermonOutline({
  outline,
  loading = false,
}: SermonOutlineProps): React.ReactElement {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-700"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-700"></div>
            <div className="ml-4 h-3 w-48 rounded bg-zinc-200 dark:bg-zinc-700"></div>
          </div>
        ))}
      </div>
    );
  }

  if (outline == null) {
    return (
      <div className="rounded-lg bg-zinc-100 p-6 text-center text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        Enter a passage to generate a suggested outline
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4 dark:border-zinc-700">
        {outline.title != null && (
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {outline.title}
          </h2>
        )}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{outline.passage}</p>
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          Note: This is a suggested outline. The actual sermon may differ.
        </p>
      </div>

      {/* Main Points */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Main Points
        </h3>
        <ol className="space-y-4">
          {outline.mainPoints.map((point, index) => (
            <li key={index} className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {index + 1}
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {point.heading}
                </span>
              </div>
              {point.subPoints.length > 0 && (
                <ul className="ml-9 space-y-1">
                  {point.subPoints.map((subPoint, subIndex) => (
                    <li key={subIndex} className="text-sm text-zinc-600 dark:text-zinc-300">
                      • {subPoint}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Key Themes */}
      {outline.keyThemes.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Key Themes
          </h3>
          <div className="flex flex-wrap gap-2">
            {outline.keyThemes.map((theme, index) => (
              <span
                key={index}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cross References */}
      {outline.crossReferences.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Related Passages
          </h3>
          <ul className="space-y-1">
            {outline.crossReferences.map((ref, index) => (
              <li key={index} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                {ref}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
