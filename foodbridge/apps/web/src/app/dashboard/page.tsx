import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Real-time overview of your FoodBridge platform activity
        </p>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: '📦', label: 'Total Donations', value: '147', change: '+12 today', color: 'green' },
          { icon: '🤖', label: 'AI Assessments', value: '89', change: '92% auto-approved', color: 'blue' },
          { icon: '🏢', label: 'NGOs Served', value: '23', change: '3 new this week', color: 'purple' },
          { icon: '🚚', label: 'Active Deliveries', value: '7', change: '2 in transit', color: 'orange' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{stat.change}</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-0.5 text-sm text-slate-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          href="/dashboard/ai"
          className="group flex flex-col rounded-2xl border border-slate-800 bg-gradient-to-br from-green-950/50 to-slate-900 p-6 hover:border-green-700/50 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-900/50 text-xl">🧠</div>
            <h3 className="text-lg font-semibold text-white">AI Assessment Hub</h3>
          </div>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Analyse food quality with Gemini Vision, compute safety scores, and predict surplus quantities.
          </p>
          <span className="mt-4 text-sm font-medium text-green-400 group-hover:text-green-300 transition-colors">
            Open AI Hub →
          </span>
        </Link>

        <Link
          href="/dashboard/donations"
          className="group flex flex-col rounded-2xl border border-slate-800 bg-gradient-to-br from-blue-950/50 to-slate-900 p-6 hover:border-blue-700/50 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900/50 text-xl">📦</div>
            <h3 className="text-lg font-semibold text-white">Manage Donations</h3>
          </div>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Create new donations, track status, and view matching results with NGOs.
          </p>
          <span className="mt-4 text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
            View Donations →
          </span>
        </Link>

        <div className="group flex flex-col rounded-2xl border border-slate-800 bg-gradient-to-br from-purple-950/50 to-slate-900 p-6 opacity-60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900/50 text-xl">📊</div>
            <h3 className="text-lg font-semibold text-white">Impact Analytics</h3>
          </div>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Track your environmental impact — food saved, meals served, CO₂ avoided.
          </p>
          <span className="mt-4 text-xs font-medium text-slate-500">Coming in Phase 4</span>
        </div>
      </div>
    </div>
  );
}
