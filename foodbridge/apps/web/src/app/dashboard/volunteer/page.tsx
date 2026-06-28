'use client';

import { useState, useEffect } from 'react';

interface Volunteer {
  id: string;
  vehicle_type: string | null;
  is_available: boolean;
  total_deliveries: number;
  rating: string;
  user: {
    full_name: string;
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
    pickup_address: string | null;
    is_veg: boolean;
    donor: {
      org_name: string;
    };
  };
  match: {
    ngo: {
      org_name: string;
      address: string;
    };
  };
}

const stepConfig: Record<string, { label: string; actionText: string; color: string }> = {
  assigned: { label: 'Assigned', actionText: 'Start Pickup Trip', color: 'bg-yellow-500/20 text-yellow-400' },
  picked_up: { label: 'Food Picked Up', actionText: 'Confirm Delivery Dropoff', color: 'bg-purple-500/20 text-purple-400' },
  delivered: { label: 'Completed', actionText: 'Finished', color: 'bg-green-500/20 text-green-400' },
};

export default function VolunteerPortal() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVolId, setSelectedVolId] = useState('');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch volunteers for demo profile selection
  useEffect(() => {
    async function loadVolunteers() {
      try {
        const res = await fetch('/api/v1/auth/volunteers');
        if (res.ok) {
          const data = await res.json();
          setVolunteers(data);
          if (data.length > 0) {
            setSelectedVolId(data[0].id);
          }
        } else {
          const fallback = [
            { id: '1a2b3c4d-5678-abcd-ef01-23456789abcd', vehicle_type: 'bike', is_available: true, total_deliveries: 12, rating: '4.8', user: { full_name: 'Arun Kumar' } },
            { id: '2a3b4c5d-6789-abcd-ef01-23456789abcd', vehicle_type: 'car', is_available: true, total_deliveries: 8, rating: '4.9', user: { full_name: 'Suresh Raina' } },
          ];
          setVolunteers(fallback);
          setSelectedVolId(fallback[0].id);
        }
      } catch {
        const fallback = [
          { id: '1a2b3c4d-5678-abcd-ef01-23456789abcd', vehicle_type: 'bike', is_available: true, total_deliveries: 12, rating: '4.8', user: { full_name: 'Arun Kumar' } },
          { id: '2a3b4c5d-6789-abcd-ef01-23456789abcd', vehicle_type: 'car', is_available: true, total_deliveries: 8, rating: '4.9', user: { full_name: 'Suresh Raina' } },
        ];
        setVolunteers(fallback);
        setSelectedVolId(fallback[0].id);
      }
    }
    loadVolunteers();
  }, []);

  // 2. Fetch active deliveries when profile changes
  useEffect(() => {
    if (selectedVolId) {
      fetchDeliveries();
    }
  }, [selectedVolId]);

  async function fetchDeliveries() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/deliveries?volunteer_id=${selectedVolId}`);
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
      } else {
        setDeliveries([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAvailability() {
    const vol = volunteers.find((v) => v.id === selectedVolId);
    if (!vol) return;

    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/v1/auth/volunteers/${selectedVolId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !vol.is_available }),
      });
      if (!res.ok) throw new Error('Failed to update availability');

      // Update local state
      setVolunteers((prev) =>
        prev.map((v) => (v.id === selectedVolId ? { ...v, is_available: !v.is_available } : v))
      );
      setSuccess(`Status updated to ${!vol.is_available ? 'Available' : 'Unavailable'}!`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleStatusAdvance(deliveryId: string, currentStatus: string) {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      let endpoint = `/api/v1/deliveries/${deliveryId}/pickup`;
      if (currentStatus === 'picked_up') {
        endpoint = `/api/v1/deliveries/${deliveryId}/deliver`;
      }

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup_photo_url: 'delivery-proofs/sample-pickup.jpg',
          delivery_photo_url: 'delivery-proofs/sample-delivery.jpg',
          rating_by_ngo: 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update delivery stage');

      setSuccess(data.message);
      fetchDeliveries();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const selectedVol = volunteers.find((v) => v.id === selectedVolId);
  const activeDelivery = deliveries.find((d) => d.status !== 'delivered' && d.status !== 'failed');

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🛵</span>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Volunteer Portal</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Accept tasks, view navigation routes, and log deliveries
            </p>
          </div>
        </div>

        {/* Demo profile selector */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-2">Volunteer:</label>
          <select
            value={selectedVolId}
            onChange={(e) => setSelectedVolId(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-green-500 outline-none"
          >
            {volunteers.map((vol) => (
              <option key={vol.id} value={vol.id}>
                {vol.user.full_name} ({vol.vehicle_type})
              </option>
            ))}
          </select>
        </div>
      </div>

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

      {selectedVol && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Deliveries Completed</div>
              <div className="text-2xl font-bold text-white mt-1">{selectedVol.total_deliveries}</div>
            </div>
            <span className="text-2xl">📦</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Rating</div>
              <div className="text-2xl font-bold text-yellow-400 mt-1">★ {selectedVol.rating}</div>
            </div>
            <span className="text-2xl">⭐</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Availability Status</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${selectedVol.is_available ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm font-semibold text-white">
                  {selectedVol.is_available ? 'Available for Jobs' : 'Offline'}
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleAvailability}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Toggle
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500/30 border-t-green-400" />
          <p className="mt-4 text-sm text-slate-400">Loading delivery tasks...</p>
        </div>
      ) : activeDelivery ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Active Delivery Details */}
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">📍</span>
                  <h2 className="text-lg font-semibold text-white">Active Route Task</h2>
                </div>
                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                  {activeDelivery.status === 'assigned' ? 'Assigned' : 'In Transit'}
                </span>
              </div>

              {/* Waypoint indicators */}
              <div className="relative border-l border-slate-700 ml-3 pl-6 space-y-6 my-4">
                <div className="relative">
                  <span className="absolute -left-9 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-green-950">
                    A
                  </span>
                  <div className="text-xs text-slate-400">SURPLUS PICKUP</div>
                  <div className="font-semibold text-white mt-0.5">{activeDelivery.donation.donor.org_name}</div>
                  <div className="text-sm text-slate-300 mt-1">{activeDelivery.donation.pickup_address}</div>
                </div>

                <div className="relative">
                  <span className="absolute -left-9 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-blue-950">
                    B
                  </span>
                  <div className="text-xs text-slate-400">NGO DELIVER TO</div>
                  <div className="font-semibold text-white mt-0.5">{activeDelivery.match.ngo.org_name}</div>
                  <div className="text-sm text-slate-300 mt-1">{activeDelivery.match.ngo.address}</div>
                </div>
              </div>

              {/* Action trigger button */}
              <button
                onClick={() => handleStatusAdvance(activeDelivery.id, activeDelivery.status)}
                disabled={actionLoading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/30"
              >
                {actionLoading ? 'Updating Status...' : stepConfig[activeDelivery.status]?.actionText || 'Advance'}
              </button>
            </section>
          </div>

          {/* Route Map and stats */}
          <div>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-white mb-4">Route Info</h3>
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-950/40 p-3 flex justify-between">
                  <span className="text-xs text-slate-500">Route Distance</span>
                  <span className="text-sm font-bold text-white">
                    {activeDelivery.distance_km ? `${Number(activeDelivery.distance_km).toFixed(1)} km` : 'calculating'}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-950/40 p-3 flex justify-between">
                  <span className="text-xs text-slate-500">Est. Travel Time</span>
                  <span className="text-sm font-bold text-white">
                    {activeDelivery.est_duration_mins ? `${activeDelivery.est_duration_mins} mins` : 'calculating'}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-950/40 p-3 flex justify-between">
                  <span className="text-xs text-slate-500">Donated Quantity</span>
                  <span className="text-sm font-bold text-green-400">{activeDelivery.donation.total_quantity_kg} kg</span>
                </div>
              </div>

              {/* Map stub illustration */}
              <div className="mt-6 h-40 w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                <div className="relative z-10 space-y-1">
                  <span className="text-2xl">🗺️</span>
                  <div className="text-xs font-semibold text-white">Interactive Route Map</div>
                  <div className="text-[10px] text-slate-500">Displaying navigation path between points</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <span className="text-4xl mb-4">🛵</span>
          <p className="text-lg font-medium text-white">No active delivery tasks</p>
          <p className="mt-1 text-sm text-slate-400">Toggle your availability status to receive new requests.</p>
        </div>
      )}
    </div>
  );
}
