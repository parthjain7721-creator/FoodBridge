// FoodBridge — Route Generation Routes (Phase 3)
// POST /routes/generate      — Generate optimal route for a delivery
// GET  /routes/:delivery_id  — Retrieve route for active delivery

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const router = Router();

// ─── Validation schemas ────────────────────────────────────────────────────────
const GenerateRouteSchema = z.object({
  delivery_id: z.string().uuid(),
});

/**
 * Helper to calculate distance in km using planar formula
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  // 1 degree latitude is approx 111km, longitude is approx 111km * cos(lat)
  const meanLat = (lat1 + lat2) / 2;
  const dx = dLon * 111.32 * Math.cos((meanLat * Math.PI) / 180);
  const dy = dLat * 111.32;
  return Math.sqrt(dx * dx + dy * dy);
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /routes/generate — Generate optimal pickup route
// ═══════════════════════════════════════════════════════════════════════════════
router.post(
  '/generate',
  authenticate,
  validateBody(GenerateRouteSchema),
  async (req: Request, res: Response) => {
    const { delivery_id } = req.body;

    try {
      // 1. Fetch delivery details
      const delivery = await prisma.delivery.findUnique({
        where: { id: delivery_id },
        include: {
          donation: {
            include: { donor: true },
          },
          match: {
            include: { ngo: true },
          },
        },
      });

      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }

      const donorLat = Number(delivery.donation.pickup_lat || delivery.donation.donor.latitude);
      const donorLng = Number(delivery.donation.pickup_lng || delivery.donation.donor.longitude);
      const ngoLat = Number(delivery.match.ngo.latitude);
      const ngoLng = Number(delivery.match.ngo.longitude);

      let distance = 0;
      let duration = 0;
      let polyline = '';

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        // ─── MOCK MODE: Generate realistic route coordinates ──────────────────
        console.info('[Route] No GOOGLE_MAPS_API_KEY set — generating mock route');
        const straightLineDist = getDistanceKm(donorLat, donorLng, ngoLat, ngoLng);
        distance = straightLineDist * 1.25; // Add curve factor for roads
        duration = Math.round(distance * 2.2); // Estimate ~2.2 mins per km

        // Simulated encoded polyline for donor to NGO path
        polyline = `_p~iF~ps|U_ulLnnqC_mqNvxq@` + Math.floor(Math.random() * 100);
      } else {
        try {
          const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${donorLat},${donorLng}&destination=${ngoLat},${ngoLng}&key=${apiKey}`;
          const response = await fetch(url);
          const data = (await response.json()) as any;

          if (data.status === 'OK' && data.routes?.[0]) {
            const route = data.routes[0];
            const leg = route.legs[0];
            distance = (leg.distance?.value || 0) / 1000;
            duration = Math.round((leg.duration?.value || 0) / 60);
            polyline = route.overview_polyline?.points || '';
          } else {
            console.warn('[Route] Google Maps Directions failed, using fallback mock:', data?.status);
            const straightLineDist = getDistanceKm(donorLat, donorLng, ngoLat, ngoLng);
            distance = straightLineDist * 1.25;
            duration = Math.round(distance * 2.2);
            polyline = `mock_polyline_fallback`;
          }
        } catch (apiError: any) {
          console.error('[Route] Maps API connection error:', apiError.message);
          const straightLineDist = getDistanceKm(donorLat, donorLng, ngoLat, ngoLng);
          distance = straightLineDist * 1.25;
          duration = Math.round(distance * 2.2);
          polyline = `mock_polyline_fallback`;
        }
      }

      // 2. Update delivery record
      const updatedDelivery = await prisma.delivery.update({
        where: { id: delivery_id },
        data: {
          route_polyline: polyline,
          distance_km: new Prisma.Decimal(distance),
          est_duration_mins: duration,
        },
      });

      return res.json({
        delivery_id,
        distance_km: Number(distance.toFixed(2)),
        est_duration_mins: duration,
        polyline,
        coords: {
          origin: { lat: donorLat, lng: donorLng },
          destination: { lat: ngoLat, lng: ngoLng },
        },
      });
    } catch (error: any) {
      console.error('[GenerateRoute] Error:', error.message);
      return res.status(500).json({ error: 'Route generation failed' });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// GET /routes/:delivery_id — Get route for active delivery
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/:delivery_id', authenticate, async (req: Request, res: Response) => {
  const { delivery_id } = req.params;

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: delivery_id },
      include: {
        donation: {
          include: { donor: true },
        },
        match: {
          include: { ngo: true },
        },
      },
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const donorLat = Number(delivery.donation.pickup_lat || delivery.donation.donor.latitude);
    const donorLng = Number(delivery.donation.pickup_lng || delivery.donation.donor.longitude);
    const ngoLat = Number(delivery.match.ngo.latitude);
    const ngoLng = Number(delivery.match.ngo.longitude);

    return res.json({
      delivery_id,
      distance_km: delivery.distance_km ? Number(delivery.distance_km) : null,
      est_duration_mins: delivery.est_duration_mins,
      polyline: delivery.route_polyline,
      coords: {
        origin: { lat: donorLat, lng: donorLng },
        destination: { lat: ngoLat, lng: ngoLng },
      },
    });
  } catch (error: any) {
    console.error('[GetRoute] Error:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve route' });
  }
});

export default router;
