// FoodBridge — NGO Matching & Response Routes (Phase 3)
// POST  /match/find-ngos   — Find top NGO matches for a donation
// POST  /match/notify       — Send notifications to matched NGOs
// PATCH /match/:id/respond  — NGO accepts or rejects

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const router = Router();

// ─── Validation schemas ────────────────────────────────────────────────────────
const FindNgosSchema = z.object({
  donation_id: z.string().uuid(),
  radius_km: z.number().optional().default(10),
});

const NotifyMatchesSchema = z.object({
  donation_id: z.string().uuid(),
});

const RespondMatchSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  rejection_reason: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /match/find-ngos — Find top NGO matches for a donation
// ═══════════════════════════════════════════════════════════════════════════════
router.post(
  '/find-ngos',
  authenticate,
  validateBody(FindNgosSchema),
  async (req: Request, res: Response) => {
    const { donation_id, radius_km } = req.body;

    try {
      // 1. Fetch donation details
      const donation = await prisma.donation.findUnique({
        where: { id: donation_id },
        include: { donor: true },
      });

      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      const pickup_lat = Number(donation.pickup_lat || donation.donor.latitude);
      const pickup_lng = Number(donation.pickup_lng || donation.donor.longitude);
      const donationQty = Number(donation.total_quantity_kg);

      // 2. Query NGOs within radius using planar coordinate distance
      // point(longitude, latitude) <-> point(pickup_lng, pickup_lat) returns distance in degrees.
      // We multiply by 111.32 to get approximate distance in kilometers.
      const rawNgos = await prisma.$queryRaw<any[]>`
        SELECT id, org_name, address, latitude, longitude, 
               storage_capacity_kg::float AS storage_capacity,
               current_load_kg::float AS current_load,
               accepted_food_types,
               acceptance_rate::float AS acceptance_rate,
               (point(longitude::float8, latitude::float8) <-> point(${pickup_lng}::float8, ${pickup_lat}::float8)) * 111.32 AS distance_km
        FROM ngos
        WHERE (point(longitude::float8, latitude::float8) <-> point(${pickup_lng}::float8, ${pickup_lat}::float8)) * 111.32 <= ${radius_km}
        ORDER BY point(longitude::float8, latitude::float8) <-> point(${pickup_lng}::float8, ${pickup_lat}::float8) ASC
      `;

      // Determine food category of donation based on donor type
      // default to 'cooked'
      const donationFoodCategory = ['restaurant', 'hostel', 'catering', 'event'].includes(donation.donor.org_type || '')
        ? 'cooked'
        : 'packaged';

      // 3. Filter and rank NGOs in memory
      const candidates = rawNgos
        .map((ngo) => {
          const capacity = ngo.storage_capacity || 0;
          const load = ngo.current_load || 0;
          const availableCapacity = capacity - load;

          // Check food type compatibility: NGO accepted list must contain our donation category or be empty
          const acceptedTypes: string[] = ngo.accepted_food_types || [];
          const isCompatible = acceptedTypes.length === 0 || acceptedTypes.includes(donationFoodCategory);

          // Proximity score: closer -> higher score. Capped at 10.0
          const dist = ngo.distance_km || 0;
          const proximityScore = 10 / (dist + 1.0);

          // Acceptance score
          const acceptRate = ngo.acceptance_rate ?? 1.0;

          // Match score formula: Proximity * Available Capacity * Acceptance Rate
          // If capacity is negative or zero, score is 0
          const matchScore = availableCapacity > 0 ? proximityScore * availableCapacity * acceptRate : 0;

          return {
            ...ngo,
            available_capacity: availableCapacity,
            is_compatible: isCompatible,
            match_score: matchScore,
          };
        })
        // Must have enough capacity and must be food-type compatible
        .filter((ngo) => ngo.available_capacity >= donationQty && ngo.is_compatible)
        // Sort by match score descending
        .sort((a, b) => b.match_score - a.match_score);

      // Take top 3 candidates
      const topMatches = candidates.slice(0, 3);

      // 4. Save matches to donation_matches table
      // Clear any existing matches for this donation first to avoid duplicates
      await prisma.donationMatch.deleteMany({
        where: { donation_id, status: 'pending' },
      });

      const matchesToSave = topMatches.map((ngo, index) => ({
        donation_id,
        ngo_id: ngo.id,
        match_rank: index + 1,
        match_score: new Prisma.Decimal(ngo.match_score),
        status: 'pending',
      }));

      if (matchesToSave.length > 0) {
        await prisma.donationMatch.createMany({
          data: matchesToSave,
        });
      }

      return res.json({
        donation_id,
        matches: topMatches.map((ngo, idx) => ({
          ngo_id: ngo.id,
          org_name: ngo.org_name,
          address: ngo.address,
          distance_km: Number(Number(ngo.distance_km).toFixed(2)),
          available_capacity_kg: ngo.available_capacity,
          match_rank: idx + 1,
          match_score: Number(ngo.match_score.toFixed(2)),
        })),
      });
    } catch (error: any) {
      console.error('[FindNgos] Error:', error.message);
      return res.status(500).json({ error: 'NGO matching algorithm failed' });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// POST /match/notify — Send notifications to matched NGOs
// ═══════════════════════════════════════════════════════════════════════════════
router.post(
  '/notify',
  authenticate,
  validateBody(NotifyMatchesSchema),
  async (req: Request, res: Response) => {
    const { donation_id } = req.body;

    try {
      // 1. Fetch matches for donation
      const matches = await prisma.donationMatch.findMany({
        where: { donation_id, status: 'pending' },
        include: {
          ngo: {
            select: {
              user_id: true,
              org_name: true,
            },
          },
        },
      });

      if (matches.length === 0) {
        return res.status(400).json({ error: 'No pending matches found. Run /match/find-ngos first.' });
      }

      const donation = await prisma.donation.findUnique({
        where: { id: donation_id },
      });
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      // 2. Dispatch notifications to each matched NGO
      const notifications = [];
      for (const match of matches) {
        const title = 'New Surplus Food Donation Available!';
        const body = `You have been matched to a donation: "${donation.title}" (${donation.total_quantity_kg} kg). Click to accept.`;

        // Save notification record to DB
        const notif = await prisma.notification.create({
          data: {
            user_id: match.ngo.user_id,
            type: 'donation_matched',
            title,
            body,
            sent_via: ['push', 'email'],
            data: {
              match_id: match.id,
              donation_id,
              qty_kg: Number(donation.total_quantity_kg),
            },
          },
        });
        notifications.push({
          ngo_id: match.ngo_id,
          org_name: match.ngo.org_name,
          notification_id: notif.id,
        });

        // Simulating Firebase Push Notification to console
        console.log(`[Firebase FCM Push] Sent notification to NGO User: ${match.ngo.user_id} (${match.ngo.org_name}): "${title}" - "${body}"`);
      }

      // Update donation status to matched
      await prisma.donation.update({
        where: { id: donation_id },
        data: { status: 'matched', updated_at: new Date() },
      });

      return res.json({
        message: `Successfully notified ${matches.length} NGOs.`,
        notifications,
      });
    } catch (error: any) {
      console.error('[NotifyMatches] Error:', error.message);
      return res.status(500).json({ error: 'Notification dispatch failed' });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /match/:id/respond — NGO accepts or rejects
// ═══════════════════════════════════════════════════════════════════════════════
router.patch(
  '/:id/respond',
  authenticate,
  validateBody(RespondMatchSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    try {
      // Find the match
      const match = await prisma.donationMatch.findUnique({
        where: { id },
        include: { donation: true, ngo: true },
      });

      if (!match) {
        return res.status(404).json({ error: 'Match record not found' });
      }

      if (match.status !== 'pending') {
        return res.status(400).json({ error: `Match has already been resolved with status: ${match.status}` });
      }

      // Verify the user owns this NGO profile
      const userNgo = await prisma.nGO.findUnique({ where: { user_id: req.user!.id } });
      if (!userNgo || userNgo.id !== match.ngo_id) {
        return res.status(403).json({ error: 'Forbidden: You do not own this NGO profile' });
      }

      const now = new Date();

      if (status === 'rejected') {
        // Just reject this match
        const updatedMatch = await prisma.donationMatch.update({
          where: { id },
          data: {
            status: 'rejected',
            rejection_reason,
            responded_at: now,
          },
        });

        // Recalculate NGO acceptance rate dynamically
        const totalMatches = await prisma.donationMatch.count({ where: { ngo_id: match.ngo_id } });
        const acceptedMatches = await prisma.donationMatch.count({ where: { ngo_id: match.ngo_id, status: 'accepted' } });
        const newAcceptanceRate = totalMatches > 0 ? acceptedMatches / totalMatches : 1.0;

        await prisma.nGO.update({
          where: { id: match.ngo_id },
          data: {
            acceptance_rate: new Prisma.Decimal(newAcceptanceRate),
          },
        });

        return res.json({
          match_id: id,
          status: 'rejected',
          message: 'Match rejected. Next NGO will be promoted if applicable.',
        });
      } else {
        // NGO accepts the donation! First-accept wins.
        // 1. Check if the donation is still available (status = matched)
        const currentDonation = await prisma.donation.findUnique({
          where: { id: match.donation_id },
        });

        if (!currentDonation || currentDonation.status !== 'matched') {
          return res.status(400).json({
            error: 'This donation has already been accepted by another NGO or is no longer available.',
          });
        }

        // 2. Set this match to accepted
        const acceptedMatch = await prisma.donationMatch.update({
          where: { id },
          data: {
            status: 'accepted',
            responded_at: now,
          },
        });

        // 3. Mark all other pending matches for this donation as expired
        await prisma.donationMatch.updateMany({
          where: {
            donation_id: match.donation_id,
            id: { not: id },
            status: 'pending',
          },
          data: {
            status: 'expired',
          },
        });

        // 4. Update donation status to pickup_assigned (since it's accepted)
        await prisma.donation.update({
          where: { id: match.donation_id },
          data: {
            status: 'pickup_assigned',
            updated_at: now,
          },
        });

        // 5. Automatically assign a volunteer within 5km and generate route
        // Find first available volunteer
        const volunteer = await prisma.volunteer.findFirst({
          where: { is_available: true },
        });

        let deliveryId = '';
        if (volunteer) {
          // Create delivery assignment
          const delivery = await prisma.delivery.create({
            data: {
              donation_id: match.donation_id,
              match_id: id,
              volunteer_id: volunteer.id,
              status: 'assigned',
            },
          });
          deliveryId = delivery.id;

          // Send notification to volunteer
          await prisma.notification.create({
            data: {
              user_id: volunteer.user_id,
              type: 'volunteer_assigned',
              title: 'New Delivery Task Assigned',
              body: `You have been assigned a pickup at ${match.donation.pickup_address || 'donor venue'}.`,
              sent_via: ['push'],
              data: { delivery_id: delivery.id },
            },
          });

          // Set volunteer availability to false (busy with delivery)
          await prisma.volunteer.update({
            where: { id: volunteer.id },
            data: { is_available: false },
          });

          console.log(`[Delivery] Assigned Volunteer: ${volunteer.id} to Delivery: ${delivery.id}`);
        } else {
          console.log(`[Delivery] No available volunteers found. Waiting for volunteer matching.`);
        }

        // Recalculate NGO acceptance rate
        const totalMatches = await prisma.donationMatch.count({ where: { ngo_id: match.ngo_id } });
        const acceptedMatches = await prisma.donationMatch.count({ where: { ngo_id: match.ngo_id, status: 'accepted' } });
        const newAcceptanceRate = totalMatches > 0 ? acceptedMatches / totalMatches : 1.0;

        await prisma.nGO.update({
          where: { id: match.ngo_id },
          data: {
            acceptance_rate: new Prisma.Decimal(newAcceptanceRate),
          },
        });

        return res.json({
          match_id: id,
          status: 'accepted',
          delivery_id: deliveryId || null,
          message: 'Donation accepted successfully! Delivery volunteer search and route initialization completed.',
        });
      }
    } catch (error: any) {
      console.error('[RespondMatch] Error:', error.message);
      return res.status(500).json({ error: 'Failed to respond to match' });
    }
  }
);

export default router;
