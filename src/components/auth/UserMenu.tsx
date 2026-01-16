/**
 * User menu dropdown for authenticated users
 * Shows profile link and sign out option
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function UserMenu(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async (): Promise<void> => {
    setIsOpen(false);
    await signOut();
  };

  // Get display name or email initial
  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {/* Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {initial}
        </div>
        <span className="hidden sm:inline">{displayName}</span>
        {/* Dropdown arrow */}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{displayName}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Profile & Settings
          </Link>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
