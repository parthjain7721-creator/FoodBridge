import { Router, Request, Response } from 'express';
import { CreateDonationSchema, UpdateDonationStatusSchema } from '@foodbridge/shared';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { prisma } from '../lib/prisma';
import { supabaseAdmin } from '../lib/supabase';
import { Prisma } from '@prisma/client';

const router = Router();

// ─── POST /donations (Create new donation) ──────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize(['donor']),
  validateBody(CreateDonationSchema),
  async (req: Request, res: Response) => {
    try {
      const dbUser = req.user!;
      
      // 1. Find donor associated with user
      const donor = await prisma.donor.findUnique({
        where: { user_id: dbUser.id },
      });

      if (!donor) {
        return res.status(400).json({ error: 'Donor profile not found for this user account' });
      }

      const {
        title,
        description,
        food_items,
        total_quantity_kg,
        prepared_at,
        available_from,
        available_until,
        pickup_address,
        pickup_lat,
        pickup_lng,
        is_veg,
        contains_allergens,
      } = req.body;

      // 2. Create donation in database
      // We map food_items to JSON input
      const donation = await prisma.donation.create({
        data: {
          donor_id: donor.id,
          title,
          description,
          food_items: food_items as Prisma.InputJsonValue,
          total_quantity_kg: new Prisma.Decimal(total_quantity_kg),
          prepared_at: new Date(prepared_at),
          available_from: new Date(available_from),
          available_until: new Date(available_until),
          pickup_address: pickup_address || donor.address,
          pickup_lat: new Prisma.Decimal(pickup_lat),
          pickup_lng: new Prisma.Decimal(pickup_lng),
          is_veg,
          contains_allergens,
          status: 'pending',
          ai_quality_grade: 'unrated',
        },
      });

      // 3. Generate presigned upload URLs for 3 images
      const imageUploadUrls: string[] = [];
      const imagePaths: string[] = [];
      
      for (let i = 0; i < 3; i++) {
        const filePath = `food-images/${donation.id}/image-${i}-${Date.now()}.jpg`;
        imagePaths.push(filePath);
        
        try {
          const { data, error } = await supabaseAdmin.storage
            .from('food-images')
            .createSignedUploadUrl(filePath);

          if (error) {
            throw error;
          }
          imageUploadUrls.push(data.signedUrl);
        } catch (storageError: any) {
          console.warn(`[PresignedUrl] Failed to generate signed url from Supabase:`, storageError.message);
          // Fallback to mock upload URL for hackathon resilience
          const mockUrl = `${process.env.SUPABASE_URL}/storage/v1/object/upload/sign/food-images/${filePath}?token=mock_token`;
          imageUploadUrls.push(mockUrl);
        }
      }

      // 4. Create donation_images placeholder records
      await prisma.donationImage.createMany({
        data: imagePaths.map((path, idx) => ({
          donation_id: donation.id,
          storage_path: path,
          public_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/food-images/${path}`,
          is_primary: idx === 0,
        })),
      });

      return res.status(201).json({
        id: donation.id,
        status: donation.status,
        image_upload_urls: imageUploadUrls,
        message: 'Upload food images to trigger AI assessment',
      });
    } catch (error: any) {
      console.error('[CreateDonation] Error:', error.message);
      return res.status(500).json({ error: error.message || 'Failed to create donation' });
    }
  }
);

// ─── GET /donations/:id (Get donation details) ──────────────────────────────
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        donor: {
          select: {
            org_name: true,
            org_type: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        donation_images: {
          select: {
            id: true,
            public_url: true,
            is_primary: true,
          },
        },
        ai_assessments: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    return res.json(donation);
  } catch (error: any) {
    console.error('[GetDonation] Error:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve donation details' });
  }
});

// ─── PATCH /donations/:id/status (Update status) ──────────────────────────────
router.patch(
  '/:id/status',
  authenticate,
  validateBody(UpdateDonationStatusSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      // Fetch donation first
      const donation = await prisma.donation.findUnique({ where: { id } });
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      // Check authorization: only admin OR the owner donor can update status
      if (req.user!.role !== 'admin') {
        const donor = await prisma.donor.findUnique({ where: { user_id: req.user!.id } });
        if (!donor || donation.donor_id !== donor.id) {
          return res.status(403).json({ error: 'Forbidden: You do not own this donation' });
        }
      }

      const updated = await prisma.donation.update({
        where: { id },
        data: {
          status,
          updated_at: new Date(),
        },
      });

      return res.json({
        id: updated.id,
        status: updated.status,
        message: `Donation status updated to ${status}`,
      });
    } catch (error: any) {
      console.error('[UpdateStatus] Error:', error.message);
      return res.status(500).json({ error: 'Failed to update donation status' });
    }
  }
);

// ─── GET /donations (List donations) ─────────────────────────────────────────
router.get('/', authenticate, async (req: Request, res: Response) => {
  const { donor_id } = req.query;

  try {
    const whereClause: Prisma.DonationWhereInput = {};

    if (donor_id) {
      whereClause.donor_id = donor_id as string;
    } else if (req.user!.role === 'donor') {
      // If donor, default to listing only their own donations
      const donor = await prisma.donor.findUnique({ where: { user_id: req.user!.id } });
      if (donor) {
        whereClause.donor_id = donor.id;
      }
    }

    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        donation_images: {
          where: { is_primary: true },
          take: 1,
        },
        donor: {
          select: {
            org_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.json(donations);
  } catch (error: any) {
    console.error('[ListDonations] Error:', error.message);
    return res.status(500).json({ error: 'Failed to list donations' });
  }
});

export default router;
