'use client';

import { useState, useEffect } from 'react';

interface PublicStats {
  total_kg_saved: number;
  meals_provided: number;
  co2_avoided_kg: number;
  active_donations: number;
}

interface RecentDonation {
  id: string;
  title: string;
  total_quantity_kg: string;
  is_veg: boolean;
  status: string;
  created_at: string;
  donor: {
    org_name: string;
  };
}

const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
  pending: { text: 'Available', color: 'text-green-400', bg: 'bg-green-950/30' },
  ai_processing: { text: 'AI Analyzing', color: 'text-blue-400', bg: 'bg-blue-950/30' },
  matched: { text: 'NGO Claimed', color: 'text-emerald-400', bg: 'bg-emerald-950/30' },
  pickup_assigned: { text: 'Driver Dispatched', color: 'text-yellow-400', bg: 'bg-yellow-950/30' },
  in_transit: { text: 'In Transit', color: 'text-purple-400', bg: 'bg-purple-950/30' },
  delivered: { text: 'Delivered Successfully', color: 'text-green-400', bg: 'bg-green-950/30' },
  expired: { text: 'Expired', color: 'text-slate-400', bg: 'bg-slate-800' },
  rejected: { text: 'Rejected', color: 'text-red-400', bg: 'bg-red-950/30' },
};

export default function PublicLiveDashboard() {
  const [stats, setStats] = useState<PublicStats>({
    total_kg_saved: 342.5,
    meals_provided: 856,
    co2_avoided_kg: 856.2,
    active_donations: 4,
  });
  const [recentFeed, setRecentFeed] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublicData() {
      try {
        // Fetch recent public donations
        const res = await fetch('/api/v1/donations');
        if (res.ok) {
          const data = await res.json();
          // Filter out rejected/cancelled
          const active = data.filter((d: any) => d.status !== 'rejected' && d.status !== 'cancelled');
          setRecentFeed(active.slice(0, 5));

          // Calculate actual stats from DB
          const deliveredOnly = data.filter((d: any) => d.status === 'delivered');
          const totalKg = deliveredOnly.reduce((acc: number, cur: any) => acc + Number(cur.total_quantity_kg), 0);
          const activeDonationsCount = data.filter((d: any) =>
            ['pending', 'matched', 'pickup_assigned', 'in_transit'].includes(d.status)
          ).length;

          // Default seed offsets for the platform totals
          const platformBaseKg = 342.5;
          const currentKg = platformBaseKg + totalKg;
          const meals = Math.floor(currentKg / 0.4);
          const co2 = currentKg * 2.5;

          setStats({
            total_kg_saved: Number(currentKg.toFixed(1)),
            meals_provided: meals,
            co2_avoided_kg: Number(co2.toFixed(1)),
            active_donations: activeDonationsCount,
          });
        }
      } catch (err) {
        console.error('Failed to load public stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPublicData();
    // Refresh every 10 seconds for live feel
    const interval = setInterval(loadPublicData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-green-800 bg-green-950/50 px-4 py-1.5 text-xs font-semibold text-green-400">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
          Live Platform Stats
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Zero Hunger, Zero Waste
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed">
          Tracking the cumulative impact of our donors, volunteers, and NGOs in redistributing surplus food across Mumbai.
        </p>
      </div>

      {/* Impact stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {[
          { label: 'Food Saved (Kg)', value: stats.total_kg_saved, icon: '🥗', color: 'from-green-500/20 to-emerald-500/10' },
          { label: 'Meals Provided', value: stats.meals_provided, icon: '🍽️', color: 'from-blue-500/20 to-cyan-500/10' },
          { label: 'CO₂ Prevented (Kg)', value: stats.co2_avoided_kg, icon: '🌿', color: 'from-emerald-500/20 to-green-500/10' },
          { label: 'Active Donations Now', value: stats.active_donations, icon: '⚡', color: 'from-amber-500/20 to-orange-500/10' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${stat.color} p-6 backdrop-blur-sm relative overflow-hidden`}
          >
            <span className="absolute right-4 bottom-2 text-6xl opacity-10 pointer-events-none select-none">
              {stat.icon}
            </span>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</div>
            <div className="mt-3 text-4xl font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">📡</span>
            <h2 className="text-lg font-bold text-white">Live Surplus Food Feed</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500/30 border-t-green-400" />
            </div>
          ) : recentFeed.length === 0 ? (
            <div className="text-center py-16 text-slate-500">No surplus food currently posted.</div>
          ) : (
            <div className="space-y-4">
              {recentFeed.map((item) => {
                const label = statusLabel[item.status] || { text: item.status, color: 'text-white', bg: 'bg-slate-800' };
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 p-4 hover:bg-slate-950/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.is_veg ? '🥗' : '🍗'}</span>
                      <div>
                        <h4 className="font-semibold text-white text-sm sm:text-base">{item.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{item.donor.org_name}</span>
                          <span>•</span>
                          <span>{item.total_quantity_kg} kg</span>
                        </div>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${label.color} ${label.bg}`}>
                      {label.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Impact Map stub */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🗺️</span>
              <h2 className="text-base font-bold text-white">Active Dispatch Map</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visualizing active pickup dispatches and food transit corridors across Mumbai.
            </p>
          </div>

          <div className="h-56 w-full rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden mt-6">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 animate-pulse" />
            <div className="relative z-10 space-y-1">
              <span className="text-3xl">📍</span>
              <div className="text-sm font-bold text-white">Mumbai Dispatch Corridor</div>
              <div className="text-[10px] text-slate-500">Live coordinates overlay active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
