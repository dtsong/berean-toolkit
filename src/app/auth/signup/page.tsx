/**
 * Signup page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage(): React.ReactElement {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-zinc-500">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-md items-center px-6 py-4">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create Account</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Join to save your progress across devices
            </p>
          </div>

          <div className="space-y-6">
            <GoogleButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  or sign up with email
                </span>
              </div>
            </div>

            <SignupForm onSuccess={() => router.push('/')} />
          </div>
        </div>
      </main>
    </div>
  );
}
