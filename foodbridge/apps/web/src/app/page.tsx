import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌉</span>
          <span className="text-xl font-bold tracking-tight">FoodBridge</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm text-green-200 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-green-400 px-4 py-2 text-sm font-semibold text-green-950 hover:bg-green-300 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center lg:py-36">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-700 bg-green-900/50 px-4 py-1.5 text-xs font-medium text-green-300">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          Tech for Tomorrow Hackathon — SDG 2 · SDG 12
        </div>

        <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
          Bridge Surplus Food
          <br />
          <span className="text-green-400">to Those Who Need It</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-green-200 leading-relaxed">
          AI-powered food waste redistribution. Every donation is quality-assessed by Gemini Vision,
          scored for safety, and matched to the nearest NGO — in under 3 minutes.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/sign-up?role=donor"
            className="w-full rounded-xl bg-green-400 px-8 py-3.5 text-base font-semibold text-green-950 hover:bg-green-300 transition-all sm:w-auto"
          >
            Donate Food
          </Link>
          <Link
            href="/sign-up?role=ngo"
            className="w-full rounded-xl border border-green-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-900 transition-all sm:w-auto"
          >
            Register as NGO
          </Link>
          <Link
            href="/dashboard/public"
            className="w-full rounded-xl border border-green-700/50 px-8 py-3.5 text-base font-semibold text-green-300 hover:text-white transition-colors sm:w-auto"
          >
            Live Dashboard →
          </Link>
        </div>
      </section>

      {/* Impact stats strip */}
      <section className="border-t border-green-800 bg-green-950/50 px-6 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            { value: '67M', label: 'Tonnes food wasted/yr in India' },
            { value: '189M', label: 'People undernourished' },
            { value: '< 3 min', label: 'Donor posting time' },
            { value: '≥ 70', label: 'AI Safety Score to redistribute' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-green-400">{stat.value}</div>
              <div className="mt-1 text-xs text-green-400/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
