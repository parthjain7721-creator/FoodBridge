import type { ReactNode } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-3 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
              <span className="text-xl">🌉</span>
              <span className="text-lg font-bold tracking-tight">FoodBridge</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/donations"
                className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                Donations
              </Link>
              <Link
                href="/dashboard/ai"
                className="rounded-lg bg-green-900/30 px-3 py-1.5 text-sm font-medium text-green-400 transition-all"
              >
                AI Assessment
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-green-800/60 bg-green-950/50 px-3 py-1 text-xs text-green-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              API Connected
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-sm font-bold text-green-950">
              D
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 py-8 lg:px-8">{children}</main>
    </div>
  );
}
