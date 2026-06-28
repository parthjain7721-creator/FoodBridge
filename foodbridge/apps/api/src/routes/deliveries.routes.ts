// FoodBridge — Deliveries & Volunteer Assignments (Phase 3)
// POST   /deliveries              — Create delivery assignment
// PATCH  /deliveries/:id/pickup   — Volunteer confirms pickup
// PATCH  /deliveries/:id/deliver  — Volunteer confirms delivery
// GET    /deliveries              — List deliveries

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const router = Router();

// ─── Validation schemas ────────────────────────────────────────────────────────
const CreateAssignmentSchema = z.object({
  donation_id: z.string().uuid(),
  volunteer_id: z.string().uuid(),
});

const PickupDeliverySchema = z.object({
  pickup_photo_url: z.string().optional(),
});

const CompleteDeliverySchema = z.object({
  delivery_photo_url: z.string().optional(),
  rating_by_ngo: z.number().int().min(1).max(5).optional().default(5),
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /deliveries — Assign volunteer to delivery
// ═══════════════════════════════════════════════════════════════════════════════
router.post(
  '/',
  authenticate,
  validateBody(CreateAssignmentSchema),
  async (req: Request, res: Response) => {
    const { donation_id, volunteer_id } = req.body;

    try {
      // 1. Check if volunteer exists and is active
      const volunteer = await prisma.volunteer.findUnique({
        where: { id: volunteer_id },
      });

      if (!volunteer) {
        return res.status(404).json({ error: 'Volunteer not found' });
      }

      // 2. Check if donation match is accepted
      const match = await prisma.donationMatch.findFirst({
        where: { donation_id, status: 'accepted' },
      });

      if (!match) {
        return res.status(400).json({ error: 'No accepted match found for this donation.' });
      }

      // 3. Create or update delivery assignment
      const existing = await prisma.delivery.findUnique({ where: { donation_id } });

      let delivery;
      if (existing) {
        delivery = await prisma.delivery.update({
          where: { donation_id },
          data: {
            volunteer_id,
            status: 'assigned',
            assigned_at: new Date(),
          },
        });
      } else {
        delivery = await prisma.delivery.create({
          data: {
            donation_id,
            match_id: match.id,
            volunteer_id,
            status: 'assigned',
          },
        });
      }

      // 4. Update donation status to pickup_assigned
      await prisma.donation.update({
        where: { id: donation_id },
        data: { status: 'pickup_assigned', updated_at: new Date() },
      });

      // 5. Toggle volunteer availability
      await prisma.volunteer.update({
        where: { id: volunteer_id },
        data: { is_available: false },
      });

      return res.json({
        delivery_id: delivery.id,
        status: delivery.status,
        message: 'Volunteer successfully assigned to delivery task',
      });
    } catch (error: any) {
      console.error('[AssignVolunteer] Error:', error.message);
      return res.status(500).json({ error: 'Assignment failed' });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /deliveries/:id/pickup — Volunteer confirms pickup
// ═══════════════════════════════════════════════════════════════════════════════
router.patch(
  '/:id/pickup',
  authenticate,
  validateBody(PickupDeliverySchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { pickup_photo_url } = req.body;

    try {
      const delivery = await prisma.delivery.findUnique({
        where: { id },
        include: { donation: true },
      });

      if (!delivery) {
        return res.status(404).json({ error: 'Delivery assignment not found' });
      }

      if (delivery.status !== 'assigned' && delivery.status !== 'en_route_pickup') {
        return res.status(400).json({ error: `Cannot pickup; current delivery status is: ${delivery.status}` });
      }

      // Update delivery record
      const updatedDelivery = await prisma.delivery.update({
        where: { id },
        data: {
          status: 'picked_up',
          picked_up_at: new Date(),
          pickup_photo_url: pickup_photo_url || null,
        },
      });

      // Update donation status to in_transit
      await prisma.donation.update({
        where: { id: delivery.donation_id },
        data: { status: 'in_transit', updated_at: new Date() },
      });

      return res.json({
        delivery_id: id,
        status: 'picked_up',
        message: 'Pickup confirmed. Donation is now in transit.',
      });
    } catch (error: any) {
      console.error('[ConfirmPickup] Error:', error.message);
      return res.status(500).json({ error: 'Pickup confirmation failed' });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /deliveries/:id/deliver — Volunteer confirms delivery
// ═══════════════════════════════════════════════════════════════════════════════
router.patch(
  '/:id/deliver',
  authenticate,
  validateBody(CompleteDeliverySchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { delivery_photo_url, rating_by_ngo } = req.body;

    try {
      const delivery = await prisma.delivery.findUnique({
        where: { id },
        include: {
          donation: true,
          match: true,
        },
      });

      if (!delivery) {
        return res.status(404).json({ error: 'Delivery assignment not found' });
      }

      if (delivery.status !== 'picked_up' && delivery.status !== 'en_route_delivery') {
        return res.status(400).json({ error: `Cannot deliver; current delivery status is: ${delivery.status}` });
      }

      const donationQty = Number(delivery.donation.total_quantity_kg);

      // 1. Update delivery record
      const updatedDelivery = await prisma.delivery.update({
        where: { id },
        data: {
          status: 'delivered',
          delivered_at: new Date(),
          delivery_photo_url: delivery_photo_url || null,
          ngo_confirmation: true,
          rating_by_ngo,
        },
      });

      // 2. Update donation status to delivered
      await prisma.donation.update({
        where: { id: delivery.donation_id },
        data: { status: 'delivered', updated_at: new Date() },
      });

      // 3. Update NGO current load
      const ngo = await prisma.nGO.findUnique({ where: { id: delivery.match.ngo_id } });
      if (ngo) {
        const newLoad = Number(ngo.current_load_kg) + donationQty;
        await prisma.nGO.update({
          where: { id: ngo.id },
          data: { current_load_kg: new Prisma.Decimal(newLoad) },
        });
      }

      // 4. Update Donor stats & impact score (1 point per kg donated)
      const donor = await prisma.donor.findUnique({ where: { id: delivery.donation.donor_id } });
      if (donor) {
        const newKg = Number(donor.total_kg_donated) + donationQty;
        const addScore = Math.round(donationQty);
        await prisma.donor.update({
          where: { id: donor.id },
          data: {
            total_kg_donated: new Prisma.Decimal(newKg),
            impact_score: donor.impact_score + addScore,
          },
        });
      }

      // 5. Return volunteer to available status
      await prisma.volunteer.update({
        where: { id: delivery.volunteer_id },
        data: {
          is_available: true,
          total_deliveries: { increment: 1 },
        },
      });

      return res.json({
        delivery_id: id,
        status: 'delivered',
        message: 'Delivery confirmed successfully. NGO load and donor impact metrics updated.',
      });
    } catch (error: any) {
      console.error('[ConfirmDelivery] Error:', error.message);
      return res.status(500).json({ error: 'Delivery confirmation failed' });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// GET /deliveries — List deliveries
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/', authenticate, async (req: Request, res: Response) => {
  const { volunteer_id, status } = req.query;

  try {
    const whereClause: Prisma.DeliveryWhereInput = {};

    if (volunteer_id) {
      whereClause.volunteer_id = volunteer_id as string;
    } else if (req.user!.role === 'volunteer') {
      const vol = await prisma.volunteer.findUnique({ where: { user_id: req.user!.id } });
      if (vol) {
        whereClause.volunteer_id = vol.id;
      }
    }

    if (status) {
      whereClause.status = status as string;
    }

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      include: {
        donation: {
          include: { donor: true },
        },
        match: {
          include: { ngo: true },
        },
      },
      orderBy: { assigned_at: 'desc' },
    });

    return res.json(deliveries);
  } catch (error: any) {
    console.error('[ListDeliveries] Error:', error.message);
    return res.status(500).json({ error: 'Failed to list deliveries' });
  }
});

export default router;
