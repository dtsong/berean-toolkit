import { Suspense } from 'react';
import { StudyPageClient } from './StudyPageClient';

export default function StudyPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <div className="h-10 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-6 h-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-8 h-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      }
    >
      <StudyPageClient />
    </Suspense>
  );
}
