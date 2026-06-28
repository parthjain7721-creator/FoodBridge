import { Router, Request, Response } from 'express';
import { RegisterSchema, LoginSchema, UserRole } from '@foodbridge/shared';
import { validateBody } from '../middleware/validate.middleware';
import { supabaseAdmin } from '../lib/supabase';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// Extended schema to validate role-specific details during registration
const ExtendedRegisterSchema = RegisterSchema.extend({
  // Donor / NGO fields
  org_name: z.string().min(1).optional(),
  org_type: z.enum(['restaurant', 'hostel', 'event', 'catering', 'other']).optional(),
  address: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  // Volunteer fields
  vehicle_type: z.enum(['bike', 'car', 'van', 'cycle', 'walk']).optional(),
  max_load_kg: z.number().positive().optional(),
});

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post('/register', validateBody(ExtendedRegisterSchema), async (req: Request, res: Response) => {
  const { email, password, full_name, phone, role, org_name, org_type, address, latitude, longitude, vehicle_type, max_load_kg } = req.body;

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return res.status(400).json({ error: authError?.message || 'Failed to create auth user' });
    }

    const userId = authData.user.id;

    // 2. Perform database transaction to create user and role details
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: userId,
          email,
          phone,
          full_name,
          role,
          is_verified: true, // Auto-verified for hackathon flow
        },
      });

      if (role === 'donor') {
        await tx.donor.create({
          data: {
            user_id: userId,
            org_name: org_name || full_name,
            org_type: org_type || 'other',
            address: address || 'Default Address',
            latitude: latitude || 19.076,
            longitude: longitude || 72.8777,
          },
        });
      } else if (role === 'ngo') {
        await tx.nGO.create({
          data: {
            user_id: userId,
            org_name: org_name || full_name,
            address: address || 'Default Address',
            latitude: latitude || 19.076,
            longitude: longitude || 72.8777,
            storage_capacity_kg: 500,
          },
        });
      } else if (role === 'volunteer') {
        await tx.volunteer.create({
          data: {
            user_id: userId,
            vehicle_type: vehicle_type || 'bike',
            max_load_kg: max_load_kg || 20,
            is_available: true,
          },
        });
      }

      return newUser;
    });

    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: result.id,
        email: result.email,
        full_name: result.full_name,
        role: result.role,
      },
    });
  } catch (error: any) {
    console.error('[Register] Error:', error.message);
    // Cleanup Supabase user if SQL transaction failed
    try {
      const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = listUsers?.users.find((u) => u.email === email);
      if (existing) {
        await supabaseAdmin.auth.admin.deleteUser(existing.id);
      }
    } catch (cleanupErr) {
      console.error('[Register Cleanup] Failed to cleanup auth user:', cleanupErr);
    }
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post('/login', validateBody(LoginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Supabase sign in
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      return res.status(400).json({ error: error?.message || 'Invalid email or password' });
    }

    // Retrieve full user profile
    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (!dbUser.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    return res.json({
      message: 'Login successful',
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        full_name: dbUser.full_name,
        role: dbUser.role,
      },
    });
  } catch (error: any) {
    console.error('[Login] Error:', error.message);
    return res.status(500).json({ error: 'Login process failed' });
  }
});

// ─── GET /auth/ngos (List all NGOs for demo switcher) ─────────────────────────
router.get('/ngos', async (_req: Request, res: Response) => {
  try {
    const ngos = await prisma.nGO.findMany({
      orderBy: { org_name: 'asc' },
    });
    return res.json(ngos);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to list NGOs' });
  }
});

// ─── GET /auth/volunteers (List all volunteers for demo switcher) ─────────────
router.get('/volunteers', async (_req: Request, res: Response) => {
  try {
    const volunteers = await prisma.volunteer.findMany({
      include: {
        user: {
          select: {
            full_name: true,
          },
        },
      },
      orderBy: { user: { full_name: 'asc' } },
    });
    return res.json(volunteers);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to list volunteers' });
  }
});

// ─── GET /auth/matches (List matches for NGO, bypass auth for switcher demo) ──
router.get('/matches', async (req: Request, res: Response) => {
  const { ngo_id } = req.query;
  try {
    const matches = await prisma.donationMatch.findMany({
      where: ngo_id ? { ngo_id: ngo_id as string } : {},
      include: {
        donation: {
          include: {
            donor: true,
          },
        },
      },
      orderBy: { notified_at: 'desc' },
    });
    return res.json(matches);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to list matches' });
  }
});

// ─── GET /auth/deliveries (List deliveries for NGO, bypass auth for demo) ─────
router.get('/deliveries', async (req: Request, res: Response) => {
  const { ngo_id } = req.query;
  try {
    const deliveries = await prisma.delivery.findMany({
      where: ngo_id
        ? {
            match: {
              ngo_id: ngo_id as string,
            },
          }
        : {},
      include: {
        donation: {
          include: {
            donor: true,
          },
        },
        volunteer: {
          include: {
            user: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: { assigned_at: 'desc' },
    });
    return res.json(deliveries);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to list deliveries' });
  }
});

// ─── PATCH /auth/volunteers/:id/availability (Toggle availability for demo) ──
router.patch('/volunteers/:id/availability', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_available } = req.body;
  try {
    const updated = await prisma.volunteer.update({
      where: { id },
      data: { is_available },
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update volunteer availability' });
  }
});

export default router;
