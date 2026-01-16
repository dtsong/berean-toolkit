/**
 * Profile/Settings page
 * Allows users to update their display name and preferred translation
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { useAuth } from '@/hooks/useAuth';
import type { Translation } from '@/types';

export default function ProfilePage(): React.ReactElement {
  const router = useRouter();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [preferredTranslation, setPreferredTranslation] = useState<Translation>('ESV');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?next=/profile');
    }
  }, [user, loading, router]);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setPreferredTranslation((profile.preferred_translation as Translation) ?? 'ESV');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName || null,
          preferred_translation: preferredTranslation,
        }),
      });

      if (response.ok) {
        await refreshProfile();
        setMessage({ type: 'success', text: 'Settings saved successfully' });
      } else {
        const data = (await response.json()) as { error: string };
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-zinc-500">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AuthHeader title="Profile & Settings" />

      <main className="mx-auto max-w-2xl px-6 py-8">
        {/* Settings Form */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Account Settings
          </h2>

          {message && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={e => void handleSave(e)} className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                value={user.email ?? ''}
                disabled
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              />
              <p className="mt-1 text-xs text-zinc-500">Email cannot be changed</p>
            </div>

            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>

            {/* Preferred Translation */}
            <div>
              <label
                htmlFor="translation"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Preferred Bible Translation
              </label>
              <select
                id="translation"
                value={preferredTranslation}
                onChange={e => setPreferredTranslation(e.target.value as Translation)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="ESV">ESV (English Standard Version)</option>
                <option value="NIV">NIV (New International Version)</option>
                <option value="BSB">BSB (Berean Standard Bible)</option>
                <option value="KJV">KJV (King James Version)</option>
              </select>
              <p className="mt-1 text-xs text-zinc-500">
                Used as the default translation in Scripture Deep Dive
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Account Actions */}
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Account</h2>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}
