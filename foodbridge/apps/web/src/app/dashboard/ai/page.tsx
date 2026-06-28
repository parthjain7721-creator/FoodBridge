'use client';

import { useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface QualityResult {
  quality_grade: string;
  shelf_life_hours: number;
  confidence: number;
  observations: string;
  red_flags: string[];
  model: string;
  latency_ms: number;
}

interface ScoreResult {
  donation_id: string;
  safety_score: number;
  recommendation: 'recommended' | 'review' | 'blocked';
  breakdown: {
    freshness: number;
    quality: number;
    travelTime: number;
    ngoCapacity: number;
    weather: number;
    traffic: number;
    total: number;
  };
  weather: string;
  traffic: string;
}

interface SurplusResult {
  donor_id: string;
  org_name: string;
  predicted_surplus_kg: number;
  confidence: number;
  window: string;
  reasoning: string;
  model: string;
  latency_ms: number;
}

// ─── Grade config ──────────────────────────────────────────────────────────
const gradeConfig: Record<string, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  A: { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-950/50', border: 'border-green-700', emoji: '✅' },
  B: { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-700', emoji: '👍' },
  C: { label: 'Marginal', color: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-700', emoji: '⚠️' },
  UNSAFE: { label: 'Unsafe', color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-700', emoji: '❌' },
};

const recommendationConfig: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  recommended: { label: 'Recommended for Redistribution', color: 'text-green-400', bg: 'bg-green-950/30', emoji: '✅' },
  review: { label: 'Manual Review Required', color: 'text-yellow-400', bg: 'bg-yellow-950/30', emoji: '⚠️' },
  blocked: { label: 'Blocked — Not Safe', color: 'text-red-400', bg: 'bg-red-950/30', emoji: '❌' },
};

export default function AIAssessmentPage() {
  // ─── Quality Assessment State ──────────────────────────────────────────
  const [donationId, setDonationId] = useState('');
  const [imagePaths, setImagePaths] = useState('food-images/sample/img1.jpg');
  const [qualityLoading, setQualityLoading] = useState(false);
  const [qualityResult, setQualityResult] = useState<QualityResult | null>(null);
  const [qualityError, setQualityError] = useState('');

  // ─── Safety Score State ────────────────────────────────────────────────
  const [scoreDonationId, setScoreDonationId] = useState('');
  const [ngoId, setNgoId] = useState('');
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [scoreError, setScoreError] = useState('');

  // ─── Surplus Prediction State ──────────────────────────────────────────
  const [donorId, setDonorId] = useState('');
  const [surplusLoading, setSurplusLoading] = useState(false);
  const [surplusResult, setSurplusResult] = useState<SurplusResult | null>(null);
  const [surplusError, setSurplusError] = useState('');

  // ─── Handlers ──────────────────────────────────────────────────────────
  async function handleAssessQuality() {
    setQualityLoading(true);
    setQualityError('');
    setQualityResult(null);
    try {
      const res = await fetch('/api/v1/ai/assess-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          image_paths: imagePaths.split(',').map((p) => p.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Quality assessment failed');
      setQualityResult(data);
      // Auto-fill score donation ID for convenience
      if (!scoreDonationId) setScoreDonationId(donationId);
    } catch (err: any) {
      setQualityError(err.message);
    } finally {
      setQualityLoading(false);
    }
  }

  async function handleComputeScore() {
    setScoreLoading(true);
    setScoreError('');
    setScoreResult(null);
    try {
      const body: Record<string, string> = { donation_id: scoreDonationId };
      if (ngoId.trim()) body.ngo_id = ngoId.trim();
      const res = await fetch('/api/v1/ai/compute-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Score computation failed');
      setScoreResult(data);
    } catch (err: any) {
      setScoreError(err.message);
    } finally {
      setScoreLoading(false);
    }
  }

  async function handlePredictSurplus() {
    setSurplusLoading(true);
    setSurplusError('');
    setSurplusResult(null);
    try {
      const res = await fetch('/api/v1/ai/predict-surplus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donor_id: donorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Surplus prediction failed');
      setSurplusResult(data);
    } catch (err: any) {
      setSurplusError(err.message);
    } finally {
      setSurplusLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-900/50 text-xl">🧠</div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">AI Assessment Hub</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Gemini Vision quality grading · Safety scoring engine · Surplus prediction
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1: Food Quality Assessment (Gemini Vision)
            ════════════════════════════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">📸</span>
            <h2 className="text-lg font-semibold text-white">Food Quality Assessment</h2>
            <span className="ml-auto rounded-full bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-400">
              Gemini Vision
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Donation ID</label>
              <input
                type="text"
                value={donationId}
                onChange={(e) => setDonationId(e.target.value)}
                placeholder="Enter donation UUID..."
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Image Paths</label>
              <input
                type="text"
                value={imagePaths}
                onChange={(e) => setImagePaths(e.target.value)}
                placeholder="food-images/uuid/img1.jpg"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
              <p className="mt-1 text-xs text-slate-500">Comma-separated Supabase Storage paths</p>
            </div>
            <button
              onClick={handleAssessQuality}
              disabled={qualityLoading || !donationId}
              className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-green-900/30"
            >
              {qualityLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analysing with Gemini Vision...
                </span>
              ) : (
                '🔬 Run Quality Assessment'
              )}
            </button>
          </div>

          {qualityError && (
            <div className="mt-4 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              ❌ {qualityError}
            </div>
          )}

          {qualityResult && (
            <div className={`mt-5 rounded-xl border ${gradeConfig[qualityResult.quality_grade]?.border || 'border-slate-700'} ${gradeConfig[qualityResult.quality_grade]?.bg || 'bg-slate-800'} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{gradeConfig[qualityResult.quality_grade]?.emoji || '❓'}</span>
                  <div>
                    <div className={`text-2xl font-bold ${gradeConfig[qualityResult.quality_grade]?.color || 'text-white'}`}>
                      Grade {qualityResult.quality_grade}
                    </div>
                    <div className="text-xs text-slate-400">{gradeConfig[qualityResult.quality_grade]?.label || 'Unknown'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Confidence</div>
                  <div className="text-xl font-bold text-white">{(qualityResult.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="text-xs text-slate-500">Shelf Life</div>
                  <div className="text-lg font-semibold text-white">{qualityResult.shelf_life_hours}h</div>
                </div>
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="text-xs text-slate-500">Latency</div>
                  <div className="text-lg font-semibold text-white">{qualityResult.latency_ms}ms</div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-800/50 p-3 mb-3">
                <div className="text-xs text-slate-500 mb-1">Observations</div>
                <p className="text-sm text-slate-300">{qualityResult.observations}</p>
              </div>

              {qualityResult.red_flags.length > 0 && (
                <div className="rounded-lg bg-red-950/30 border border-red-900/30 p-3">
                  <div className="text-xs text-red-400 mb-1">⚠️ Red Flags</div>
                  <ul className="text-sm text-red-300 space-y-1">
                    {qualityResult.red_flags.map((flag, i) => (
                      <li key={i}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 text-xs text-slate-500">Model: {qualityResult.model}</div>
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 2: Safety Score Engine
            ════════════════════════════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">🛡️</span>
            <h2 className="text-lg font-semibold text-white">Safety Score Engine</h2>
            <span className="ml-auto rounded-full bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-400">
              6-Factor Score
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Donation ID</label>
              <input
                type="text"
                value={scoreDonationId}
                onChange={(e) => setScoreDonationId(e.target.value)}
                placeholder="Enter donation UUID..."
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">NGO ID (Optional)</label>
              <input
                type="text"
                value={ngoId}
                onChange={(e) => setNgoId(e.target.value)}
                placeholder="Leave blank for nearest NGO..."
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={handleComputeScore}
              disabled={scoreLoading || !scoreDonationId}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-900/30"
            >
              {scoreLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Computing Score...
                </span>
              ) : (
                '📊 Compute Safety Score'
              )}
            </button>
          </div>

          {scoreError && (
            <div className="mt-4 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              ❌ {scoreError}
            </div>
          )}

          {scoreResult && (
            <div className="mt-5">
              {/* Score ring */}
              <div className={`rounded-xl ${recommendationConfig[scoreResult.recommendation]?.bg} border border-slate-700 p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-4xl font-bold text-white">{scoreResult.safety_score}</div>
                    <div className="text-xs text-slate-400 mt-0.5">/ 100</div>
                  </div>
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${recommendationConfig[scoreResult.recommendation]?.color} ${recommendationConfig[scoreResult.recommendation]?.bg}`}>
                    <span>{recommendationConfig[scoreResult.recommendation]?.emoji}</span>
                    {recommendationConfig[scoreResult.recommendation]?.label}
                  </div>
                </div>

                {/* Score progress bar */}
                <div className="mb-5 h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      scoreResult.safety_score >= 70
                        ? 'bg-gradient-to-r from-green-600 to-green-400'
                        : scoreResult.safety_score >= 50
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                        : 'bg-gradient-to-r from-red-600 to-red-400'
                    }`}
                    style={{ width: `${scoreResult.safety_score}%` }}
                  />
                </div>

                {/* Breakdown bars */}
                <div className="space-y-3">
                  {[
                    { label: 'Freshness', value: scoreResult.breakdown.freshness, max: 30, color: 'bg-green-500' },
                    { label: 'Quality', value: scoreResult.breakdown.quality, max: 25, color: 'bg-blue-500' },
                    { label: 'Travel Time', value: scoreResult.breakdown.travelTime, max: 15, color: 'bg-purple-500' },
                    { label: 'NGO Capacity', value: scoreResult.breakdown.ngoCapacity, max: 15, color: 'bg-cyan-500' },
                    { label: 'Weather', value: scoreResult.breakdown.weather, max: 10, color: 'bg-amber-500' },
                    { label: 'Traffic', value: scoreResult.breakdown.traffic, max: 5, color: 'bg-orange-500' },
                  ].map((factor) => (
                    <div key={factor.label} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-slate-400">{factor.label}</div>
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${factor.color} transition-all duration-700`}
                          style={{ width: `${(factor.value / factor.max) * 100}%` }}
                        />
                      </div>
                      <div className="w-10 text-right text-xs font-medium text-white">{factor.value}/{factor.max}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-4 text-xs text-slate-500">
                  <span>🌤️ {scoreResult.weather}</span>
                  <span>🚗 {scoreResult.traffic}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 3: Surplus Prediction (Gemini Flash)
            ════════════════════════════════════════════════════════════════════ */}
        <section className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">📈</span>
            <h2 className="text-lg font-semibold text-white">Surplus Prediction</h2>
            <span className="ml-auto rounded-full bg-purple-900/30 px-2.5 py-0.5 text-xs font-medium text-purple-400">
              Gemini Flash
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Donor ID</label>
                <input
                  type="text"
                  value={donorId}
                  onChange={(e) => setDonorId(e.target.value)}
                  placeholder="Enter donor UUID..."
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
              <button
                onClick={handlePredictSurplus}
                disabled={surplusLoading || !donorId}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-semibold text-white hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-900/30"
              >
                {surplusLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Predicting...
                  </span>
                ) : (
                  '🔮 Predict Surplus'
                )}
              </button>

              {surplusError && (
                <div className="rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                  ❌ {surplusError}
                </div>
              )}
            </div>

            {surplusResult && (
              <div className="rounded-xl border border-purple-800/40 bg-purple-950/20 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <div className="text-xs text-slate-400">Predicted Surplus</div>
                    <div className="text-3xl font-bold text-white">{surplusResult.predicted_surplus_kg} kg</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs text-slate-400">Confidence</div>
                    <div className="text-2xl font-bold text-purple-400">{(surplusResult.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg bg-slate-800/50 p-3">
                    <div className="text-xs text-slate-500">Pickup Window</div>
                    <div className="text-base font-semibold text-white">🕐 {surplusResult.window}</div>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 p-3">
                    <div className="text-xs text-slate-500">Organisation</div>
                    <div className="text-base font-semibold text-white">{surplusResult.org_name}</div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="text-xs text-slate-500 mb-1">AI Reasoning</div>
                  <p className="text-sm text-slate-300">{surplusResult.reasoning}</p>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Model: {surplusResult.model}</span>
                  <span>Latency: {surplusResult.latency_ms}ms</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
