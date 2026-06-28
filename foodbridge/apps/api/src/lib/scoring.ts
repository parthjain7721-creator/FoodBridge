// FoodBridge — Donation Safety Score Engine
// TRD Section 4.2 — computed server-side after AI assessment
//
// 6 factors, max score 100:
//   Freshness window    30 pts
//   Food quality grade  25 pts
//   Travel time         15 pts
//   NGO capacity        15 pts
//   Weather conditions  10 pts
//   Traffic conditions   5 pts
//
// Thresholds:
//   ≥ 70 → Recommended ✅
//   50–69 → Manual review ⚠️
//   < 50 → Blocked ❌

export interface ScoreInput {
  shelfLifeHours: number;
  qualityGrade: 'A' | 'B' | 'C' | 'UNSAFE';
  travelTimeMins: number;
  ngoCapacityPct: number; // 0–100, percentage of available capacity
  isExtremeWeather: boolean;
  trafficCongestion: 'low' | 'medium' | 'high';
}

export interface ScoreBreakdown {
  freshness: number;
  quality: number;
  travelTime: number;
  ngoCapacity: number;
  weather: number;
  traffic: number;
  total: number;
  recommendation: 'recommended' | 'review' | 'blocked';
}

/**
 * Maps a value into a score using piecewise linear interpolation.
 * thresholds and scores must be the same length and sorted ascending.
 */
function mapToScore(value: number, thresholds: number[], scores: number[]): number {
  if (value <= thresholds[0]) return scores[0];
  if (value >= thresholds[thresholds.length - 1]) return scores[scores.length - 1];

  for (let i = 1; i < thresholds.length; i++) {
    if (value <= thresholds[i]) {
      const ratio = (value - thresholds[i - 1]) / (thresholds[i] - thresholds[i - 1]);
      return scores[i - 1] + ratio * (scores[i] - scores[i - 1]);
    }
  }
  return scores[scores.length - 1];
}

/**
 * Compute the safety score for a donation.
 * Follows the exact formula from TRD Section 4.2.
 */
export function computeSafetyScore(input: ScoreInput): ScoreBreakdown {
  const freshness = mapToScore(input.shelfLifeHours, [0, 2, 4, 8, 12], [0, 20, 25, 30, 30]);

  const qualityMap: Record<string, number> = { A: 25, B: 18, C: 10, UNSAFE: 0 };
  const quality = qualityMap[input.qualityGrade] ?? 0;

  const travelTime = mapToScore(input.travelTimeMins, [0, 15, 30, 60], [15, 15, 10, 5]);

  const ngoCapacity = mapToScore(input.ngoCapacityPct, [0, 20, 50, 80], [0, 8, 12, 15]);

  const weather = input.isExtremeWeather ? 5 : 10;

  const traffic = input.trafficCongestion === 'high' ? 3 : input.trafficCongestion === 'medium' ? 4 : 5;

  const total = Math.round(freshness + quality + travelTime + ngoCapacity + weather + traffic);

  let recommendation: 'recommended' | 'review' | 'blocked';
  if (total >= 70) recommendation = 'recommended';
  else if (total >= 50) recommendation = 'review';
  else recommendation = 'blocked';

  return {
    freshness: Math.round(freshness),
    quality,
    travelTime: Math.round(travelTime),
    ngoCapacity: Math.round(ngoCapacity),
    weather,
    traffic,
    total,
    recommendation,
  };
}

/**
 * Generate a mock weather assessment for hackathon demo.
 * Replace with OpenWeatherMap API call in production.
 */
export function getMockWeather(): { isExtremeWeather: boolean; description: string; tempC: number } {
  // Simulate mild weather for Mumbai
  return {
    isExtremeWeather: false,
    description: 'Partly cloudy, 28°C',
    tempC: 28,
  };
}

/**
 * Generate a mock traffic assessment for hackathon demo.
 * Replace with Google Maps Distance Matrix API call in production.
 */
export function getMockTraffic(): { congestion: 'low' | 'medium' | 'high'; estimatedMins: number } {
  // Simulate moderate traffic
  return {
    congestion: 'medium',
    estimatedMins: 22,
  };
}
