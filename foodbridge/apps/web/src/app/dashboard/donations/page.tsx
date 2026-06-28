'use client';

import { useState, useEffect } from 'react';

interface Donation {
  id: string;
  title: string;
  description: string | null;
  total_quantity_kg: string;
  is_veg: boolean;
  status: string;
  safety_score: number | null;
  ai_quality_grade: string | null;
  ai_shelf_life_hrs: number | null;
  created_at: string;
  available_until: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  ai_processing: { label: 'AI Processing', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  matched: { label: 'Matched', color: 'text-green-400', bg: 'bg-green-900/30' },
  pickup_assigned: { label: 'Pickup Assigned', color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
  in_transit: { label: 'In Transit', color: 'text-purple-400', bg: 'bg-purple-900/30' },
  delivered: { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
  cancelled: { label: 'Cancelled', color: 'text-slate-400', bg: 'bg-slate-800' },
  expired: { label: 'Expired', color: 'text-orange-400', bg: 'bg-orange-900/30' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-900/30' },
};

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/donations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch donations');
      setDonations(data.data || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Donations</h1>
          <p className="mt-1 text-sm text-slate-400">
            All food donations across the platform
          </p>
        </div>
        <button
          onClick={fetchDonations}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500/30 border-t-green-400" />
          <p className="mt-4 text-sm text-slate-400">Loading donations...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-20">
          <span className="text-4xl mb-4">📦</span>
          <p className="text-lg font-medium text-white">No donations yet</p>
          <p className="mt-1 text-sm text-slate-400">Donations will appear here once created via the API</p>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map((d) => {
            const status = statusConfig[d.status] || statusConfig.pending;
            return (
              <div
                key={d.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{d.is_veg ? '🥗' : '🍗'}</span>
                    <div>
                      <h3 className="text-base font-semibold text-white">{d.title}</h3>
                      {d.description && <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color} ${status.bg}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-slate-800/50 p-2.5">
                    <div className="text-xs text-slate-500">Quantity</div>
                    <div className="text-sm font-semibold text-white">{d.total_quantity_kg} kg</div>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 p-2.5">
                    <div className="text-xs text-slate-500">Safety Score</div>
                    <div className={`text-sm font-semibold ${d.safety_score ? (d.safety_score >= 70 ? 'text-green-400' : d.safety_score >= 50 ? 'text-yellow-400' : 'text-red-400') : 'text-slate-500'}`}>
                      {d.safety_score !== null ? `${d.safety_score}/100` : 'Pending'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 p-2.5">
                    <div className="text-xs text-slate-500">Quality Grade</div>
                    <div className="text-sm font-semibold text-white">
                      {d.ai_quality_grade || 'Unrated'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 p-2.5">
                    <div className="text-xs text-slate-500">Shelf Life</div>
                    <div className="text-sm font-semibold text-white">
                      {d.ai_shelf_life_hrs ? `${d.ai_shelf_life_hrs}h` : '–'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span>ID: {d.id.slice(0, 8)}...</span>
                  <span>Created: {new Date(d.created_at).toLocaleDateString()}</span>
                  <span>Expires: {new Date(d.available_until).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
