import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthHeader } from '@/components/auth/AuthHeader';

export const metadata: Metadata = {
  title: 'Berean Toolkit - Scripture Study Tools',
  description:
    "A suite of Scripture study tools designed to help Christians grow in knowledge, wisdom, and spiritual maturity through deeper engagement with God's Word.",
};

export default function Home(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <AuthHeader title="Berean Toolkit" showBackLink={false} />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Berean Toolkit
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Scripture study tools designed to help Christians grow in knowledge, wisdom, and
            spiritual maturity through deeper engagement with God&apos;s Word.
          </p>
          <p className="mt-4 text-sm italic text-zinc-500 dark:text-zinc-500">
            &quot;Now the Bereans were more noble-minded than the Thessalonians, for they received
            the message with great eagerness and examined the Scriptures daily to see if these
            teachings were true.&quot; — Acts 17:11
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Scripture Deep Dive */}
          <Link
            href="/study"
            className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl dark:bg-blue-900/30">
              📖
            </div>
            <h2 className="mb-2 text-xl font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
              Scripture Deep Dive
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Look up any verse and explore the original Hebrew or Greek with Strong&apos;s
              Concordance definitions and word studies.
            </p>
          </Link>

          {/* Berean Challenge */}
          <Link
            href="/berean"
            className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-green-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-green-700"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-2xl dark:bg-green-900/30">
              🎯
            </div>
            <h2 className="mb-2 text-xl font-semibold text-zinc-900 group-hover:text-green-600 dark:text-zinc-100 dark:group-hover:text-green-400">
              Berean Challenge
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Test and grow your Scripture knowledge with fun, gamified challenges inspired by
              Wordle.
            </p>
          </Link>

          {/* Sermon Companion */}
          <Link
            href="/sermon"
            className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-purple-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-purple-700"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-2xl dark:bg-purple-900/30">
              📝
            </div>
            <h2 className="mb-2 text-xl font-semibold text-zinc-900 group-hover:text-purple-600 dark:text-zinc-100 dark:group-hover:text-purple-400">
              Sermon Companion
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Generate sermon outlines, reflection questions, and notes to engage more deeply with
              Sunday messages.
            </p>
          </Link>
        </div>

        {/* Mission Statement */}
        <div className="mt-12 rounded-lg bg-zinc-100 p-6 dark:bg-zinc-900">
          <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">Our Mission</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Berean Toolkit is built in the spirit of{' '}
            <a
              href="https://www.basiltech.org/"
              className="text-blue-600 hover:underline dark:text-blue-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              Basil Tech
            </a>{' '}
            — using technology skills for Jesus. Like Bezalel, whom God filled with His Spirit and
            skill to design the Tabernacle, we want to be called by God and used for His work in the
            world.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        <p>Built for the glory of God and the edification of His Church</p>
      </footer>
    </div>
  );
}
