/**
 * Reusable header component with authentication state
 * Shows login/signup buttons when logged out, user menu when logged in
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from './UserMenu';

interface AuthHeaderProps {
  title: string;
  showBackLink?: boolean;
  backHref?: string;
  children?: React.ReactNode;
}

export function AuthHeader({
  title,
  showBackLink = true,
  backHref = '/',
  children,
}: AuthHeaderProps): React.ReactElement {
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        {/* Left side: Back link and title */}
        <div>
          {showBackLink && (
            <Link
              href={backHref}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              ← Back to Home
            </Link>
          )}
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
        </div>

        {/* Right side: Auth state + optional children */}
        <div className="flex items-center gap-4">
          {children}

          {loading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"></div>
          ) : user ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
