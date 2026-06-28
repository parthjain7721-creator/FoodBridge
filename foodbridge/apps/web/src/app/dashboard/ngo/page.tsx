'use client';

import { useState, useEffect } from 'react';

interface NGO {
  id: string;
  org_name: string;
  current_load_kg: string;
  storage_capacity_kg: string;
}

interface Match {
  id: string;
  donation_id: string;
  match_rank: number;
  match_score: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  donation: {
    id: string;
    title: string;
    description: string | null;
    total_quantity_kg: string;
    is_veg: boolean;
    safety_score: number | null;
    ai_quality_grade: string | null;
    ai_shelf_life_hrs: number | null;
    pickup_address: string | null;
    donor: {
      org_name: string;
    };
  };
}

interface Delivery {
  id: string;
  donation_id: string;
  status: 'assigned' | 'en_route_pickup' | 'picked_up' | 'en_route_delivery' | 'delivered' | 'failed';
  distance_km: string | null;
  est_duration_mins: number | null;
  assigned_at: string;
  donation: {
    title: string;
    total_quantity_kg: string;
    donor: {
      org_name: string;
    };
  };
  volunteer: {
    vehicle_type: string | null;
    user: {
      full_name: string;
    };
  };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  assigned: { label: 'Volunteer Assigned', color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  en_route_pickup: { label: 'En Route to Pickup', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  picked_up: { label: 'Food Picked Up', color: 'text-purple-400', bg: 'bg-purple-900/30' },
  en_route_delivery: { label: 'En Route to Shelter', color: 'text-indigo-400', bg: 'bg-indigo-900/30' },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-900/30' },
  failed: { label: 'Delivery Failed', color: 'text-red-400', bg: 'bg-red-900/30' },
};

export default function NGODashboard() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [selectedNgoId, setSelectedNgoId] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch NGOs to let the user select their profile for demo
  useEffect(() => {
    async function loadNGOs() {
      try {
        const res = await fetch('/api/v1/auth/ngos'); // Assumes we add a quick helper to list NGOs or get mock user
        if (res.ok) {
          const data = await res.json();
          setNgos(data);
          if (data.length > 0) {
            setSelectedNgoId(data[0].id);
          }
        } else {
          // Fallback static list for demo
          const fallback = [
            { id: '8a8b8c8d-1234-5678-abcd-ef0123456789', org_name: 'Robin Hood Army Mumbai', current_load_kg: '120', storage_capacity_kg: '500' },
            { id: '9a9b9c9d-1234-5678-abcd-ef0123456789', org_name: 'Roti Bank Foundation', current_load_kg: '450', storage_capacity_kg: '1000' },
          ];
          setNgos(fallback);
          setSelectedNgoId(fallback[0].id);
        }
      } catch {
        const fallback = [
          { id: '8a8b8c8d-1234-5678-abcd-ef0123456789', org_name: 'Robin Hood Army Mumbai', current_load_kg: '120', storage_capacity_kg: '500' },
          { id: '9a9b9c9d-1234-5678-abcd-ef0123456789', org_name: 'Roti Bank Foundation', current_load_kg: '450', storage_capacity_kg: '1000' },
        ];
        setNgos(fallback);
        setSelectedNgoId(fallback[0].id);
      }
    }
    loadNGOs();
  }, []);

  // 2. Fetch matches and deliveries whenever selected NGO changes
  useEffect(() => {
    if (selectedNgoId) {
      fetchNgoData();
    }
  }, [selectedNgoId]);

  async function fetchNgoData() {
    setLoading(true);
    setError('');
    try {
      // Fetch matches for this NGO
      const matchesRes = await fetch(`/api/v1/auth/matches?ngo_id=${selectedNgoId}`);
      if (matchesRes.ok) {
        const data = await matchesRes.json();
        setMatches(data);
      } else {
        setMatches([]);
      }

      // Fetch deliveries assigned to matches of this NGO
      const delivRes = await fetch(`/api/v1/auth/deliveries?ngo_id=${selectedNgoId}`);
      if (delivRes.ok) {
        const data = await delivRes.json();
        setDeliveries(data);
      } else {
        setDeliveries([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch NGO data');
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(matchId: string, status: 'accepted' | 'rejected') {
    setActionLoadingId(matchId);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/v1/match/${matchId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejection_reason: status === 'rejected' ? 'Capacity full or unavailable slot' : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to respond to match');

      setSuccess(`Donation match successfully ${status === 'accepted' ? 'accepted' : 'rejected'}!`);
      // Auto-trigger route generation if accepted
      if (status === 'accepted' && data.delivery_id) {
        await fetch('/api/v1/routes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delivery_id: data.delivery_id }),
        });
      }

      fetchNgoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  const selectedNgo = ngos.find((n) => n.id === selectedNgoId);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏢</span>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">NGO Portal</h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Manage surplus food donations matched to your shelter
              </p>
            </div>
          </div>
        </div>

        {/* Demo profile switcher */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-2">Active Profile:</label>
          <select
            value={selectedNgoId}
            onChange={(e) => setSelectedNgoId(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-green-500 outline-none"
          >
            {ngos.map((ngo) => (
              <option key={ngo.id} value={ngo.id}>
                {ngo.org_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="mb-6 rounded-lg border border-green-800/50 bg-green-950/30 px-4 py-3 text-sm text-green-400">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      {/* Storage capacity banner */}
      {selectedNgo && (
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-400">Storage Capacity Status</div>
            <div className="text-sm font-semibold text-white">
              {selectedNgo.current_load_kg} / {selectedNgo.storage_capacity_kg} kg loaded
            </div>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{
                width: `${Math.min(
                  (Number(selectedNgo.current_load_kg) / Number(selectedNgo.storage_capacity_kg)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500/30 border-t-green-400" />
          <p className="mt-4 text-sm text-slate-400">Loading matches and deliveries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ════════════════════════════════════════════════════════════════════
              SECTION 1: Incoming Matched Offers
              ════════════════════════════════════════════════════════════════════ */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">🔔</span>
              <h2 className="text-lg font-semibold text-white">Surplus Matches For You</h2>
              <span className="ml-auto rounded-full bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                First-Accept Wins
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-800 rounded-xl">
                <span className="text-3xl mb-3">🤝</span>
                <p className="text-sm text-slate-400">No active surplus matches found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{match.donation.is_veg ? '🥗' : '🍗'}</span>
                          <h3 className="font-semibold text-white">{match.donation.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">from {match.donation.donor.org_name}</p>
                      </div>
                      <div className="rounded bg-blue-950 px-2 py-0.5 text-xs font-semibold text-blue-400">
                        Rank #{match.match_rank}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="rounded-lg bg-slate-900/80 p-2">
                        <div className="text-[10px] text-slate-500 uppercase font-medium">Quantity</div>
                        <div className="text-sm font-bold text-white">{match.donation.total_quantity_kg} kg</div>
                      </div>
                      <div className="rounded-lg bg-slate-900/80 p-2">
                        <div className="text-[10px] text-slate-500 uppercase font-medium">Safety Score</div>
                        <div className={`text-sm font-bold ${Number(match.donation.safety_score || 0) >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {match.donation.safety_score || '–'}/100
                        </div>
                      </div>
                      <div className="rounded-lg bg-slate-900/80 p-2">
                        <div className="text-[10px] text-slate-500 uppercase font-medium">Quality Grade</div>
                        <div className="text-sm font-bold text-slate-300">{match.donation.ai_quality_grade || '–'}</div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {match.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(match.id, 'accepted')}
                          disabled={actionLoadingId !== null}
                          className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-500 transition-colors disabled:opacity-50"
                        >
                          {actionLoadingId === match.id ? 'Processing...' : 'Accept Offer'}
                        </button>
                        <button
                          onClick={() => handleRespond(match.id, 'rejected')}
                          disabled={actionLoadingId !== null}
                          className="flex-1 rounded-lg border border-slate-700 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Resolved: {match.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 2: Active Deliveries & Volunteer tracking
              ════════════════════════════════════════════════════════════════════ */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">🚚</span>
              <h2 className="text-lg font-semibold text-white">Active Deliveries</h2>
            </div>

            {deliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-800 rounded-xl">
                <span className="text-3xl mb-3">📦</span>
                <p className="text-sm text-slate-400">No active delivery assignments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveries.map((del) => {
                  const status = statusConfig[del.status] || statusConfig.assigned;
                  return (
                    <div
                      key={del.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/40 p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{del.donation.title}</h3>
                          <p className="text-xs text-slate-400">from {del.donation.donor.org_name}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color} ${status.bg}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 rounded-lg bg-slate-900/80 p-3">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-slate-500">Delivery Agent</span>
                          <span className="font-semibold text-white">{del.volunteer.user.full_name}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-slate-500">Vehicle Type</span>
                          <span className="font-semibold text-white uppercase">{del.volunteer.vehicle_type || 'bike'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">ETA / Distance</span>
                          <span className="font-semibold text-green-400">
                            {del.est_duration_mins ? `${del.est_duration_mins} mins` : 'calculating'} ({del.distance_km ? `${Number(del.distance_km).toFixed(1)} km` : '–'})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
