import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from apps/api/.env or root
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in env to seed.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const DEFAULT_PASSWORD = 'Password123!';

async function clearDatabase() {
  console.info('Clearing existing data...');
  // Delete in order of dependency
  await prisma.delivery.deleteMany();
  await prisma.donationMatch.deleteMany();
  await prisma.aIAssessment.deleteMany(); // Fix: aIAssessment instead of aiAssessment
  await prisma.donationImage.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.nGO.deleteMany();          // Fix: nGO instead of ngo
  await prisma.donor.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.impactMetric.deleteMany();
}

async function main() {
  await clearDatabase();

  // ─── 1. Donors ─────────────────────────────────────────────────────────────
  console.info('Seeding Donors...');
  const donorsData = [
    {
      email: 'donor1@foodbridge.com',
      fullName: 'Taj Palace Restaurant',
      orgName: 'Taj Palace Restaurant',
      orgType: 'restaurant',
      address: 'Taj Palace, Colaba, Mumbai, Maharashtra 400001',
      lat: 18.9218,
      lng: 72.8333,
      avgDailyCovers: 500,
      cuisineTags: ['Indian', 'Mughlai', 'Fine Dining'],
      fssaiNumber: '12345678901234',
    },
    {
      email: 'donor2@foodbridge.com',
      fullName: 'IIT Hostel Mess 4',
      orgName: 'IIT Hostel Mess 4',
      orgType: 'hostel',
      address: 'Hostel 4, IIT Bombay, Powai, Mumbai 400076',
      lat: 19.1334,
      lng: 72.9133,
      avgDailyCovers: 800,
      cuisineTags: ['North Indian', 'South Indian', 'Vegetarian'],
      fssaiNumber: '23456789012345',
    },
    {
      email: 'donor3@foodbridge.com',
      fullName: 'Grand Palace Catering',
      orgName: 'Grand Palace Catering',
      orgType: 'catering',
      address: 'Grand Palace Banquet, Andheri East, Mumbai 400069',
      lat: 19.1155,
      lng: 72.8755,
      avgDailyCovers: 1200,
      cuisineTags: ['Chinese', 'Continental', 'Buffet'],
      fssaiNumber: '34567890123456',
    },
    {
      email: 'donor4@foodbridge.com',
      fullName: 'Jio Convention Centre Events',
      orgName: 'Jio Convention Centre Events',
      orgType: 'event',
      address: 'Jio World Convention Centre, BKC, Mumbai 400051',
      lat: 19.0622,
      lng: 72.8622,
      avgDailyCovers: 3000,
      cuisineTags: ['Multicuisine', 'Fusion'],
      fssaiNumber: '45678901234567',
    },
    {
      email: 'donor5@foodbridge.com',
      fullName: 'Daily Bread Bakery',
      orgName: 'Daily Bread Bakery',
      orgType: 'other',
      address: 'Bandra West, Mumbai 400050',
      lat: 19.0544,
      lng: 72.8402,
      avgDailyCovers: 200,
      cuisineTags: ['Bakery', 'Desserts'],
      fssaiNumber: '56789012345678',
    },
  ];

  for (const item of donorsData) {
    // Check if user already exists in Supabase to prevent duplicate key errors
    let userId = '';
    const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = listUsers?.users.find((u) => u.email === item.email);

    if (existing) {
      userId = existing.id;
    } else {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: item.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });
      if (authError || !authUser.user) {
        console.error(`Failed to create Supabase auth user for ${item.email}:`, authError?.message);
        continue;
      }
      userId = authUser.user.id;
    }

    const user = await prisma.user.create({
      data: {
        id: userId,
        email: item.email,
        full_name: item.fullName,
        role: 'donor',
        is_verified: true,
      },
    });

    await prisma.donor.create({
      data: {
        user_id: user.id,
        org_name: item.orgName,
        org_type: item.orgType,
        address: item.address,
        latitude: item.lat,
        longitude: item.lng,
        avg_daily_covers: item.avgDailyCovers,
        cuisine_tags: item.cuisineTags,
        fssai_number: item.fssaiNumber,
        impact_score: Math.floor(Math.random() * 50) + 10,
        total_kg_donated: Math.floor(Math.random() * 300) + 50,
      },
    });
  }

  // ─── 2. NGOs ───────────────────────────────────────────────────────────────
  console.info('Seeding NGOs...');
  const ngosData = [
    {
      email: 'ngo1@foodbridge.com',
      fullName: 'Robin Hood Army Mumbai',
      orgName: 'Robin Hood Army Mumbai',
      registrationNo: 'NGO-12345',
      address: 'Dharavi NGO Hub, Dharavi, Mumbai 400017',
      lat: 19.0380,
      lng: 72.8538,
      storageCapacityKg: 500,
      currentLoadKg: 120,
      acceptedFoodTypes: ['cooked', 'raw', 'packaged'],
      beneficiaryCount: 150,
    },
    {
      email: 'ngo2@foodbridge.com',
      fullName: 'Roti Bank Foundation',
      orgName: 'Roti Bank Foundation',
      registrationNo: 'NGO-67890',
      address: 'Kurla Welfare Centre, Kurla, Mumbai 400070',
      lat: 19.0728,
      lng: 72.8826,
      storageCapacityKg: 1000,
      currentLoadKg: 450,
      acceptedFoodTypes: ['cooked', 'packaged'],
      beneficiaryCount: 300,
    },
    {
      email: 'ngo3@foodbridge.com',
      fullName: 'No Hungry Child India',
      orgName: 'No Hungry Child India',
      registrationNo: 'NGO-54321',
      address: 'Ghatkopar Welfare Hall, Ghatkopar, Mumbai 400086',
      lat: 19.0864,
      lng: 72.9082,
      storageCapacityKg: 300,
      currentLoadKg: 50,
      acceptedFoodTypes: ['cooked', 'packaged', 'fruits_veg'],
      beneficiaryCount: 80,
    },
  ];

  for (const item of ngosData) {
    let userId = '';
    const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = listUsers?.users.find((u) => u.email === item.email);

    if (existing) {
      userId = existing.id;
    } else {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: item.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });
      if (authError || !authUser.user) {
        console.error(`Failed to create Supabase auth user for ${item.email}:`, authError?.message);
        continue;
      }
      userId = authUser.user.id;
    }

    const user = await prisma.user.create({
      data: {
        id: userId,
        email: item.email,
        full_name: item.fullName,
        role: 'ngo',
        is_verified: true,
      },
    });

    await prisma.nGO.create({ // Fix: nGO instead of ngo
      data: {
        user_id: user.id,
        org_name: item.orgName,
        registration_no: item.registrationNo,
        address: item.address,
        latitude: item.lat,
        longitude: item.lng,
        storage_capacity_kg: item.storageCapacityKg,
        current_load_kg: item.currentLoadKg,
        accepted_food_types: item.acceptedFoodTypes,
        beneficiary_count: item.beneficiaryCount,
        operating_hours: {
          mon: ['08:00', '22:00'],
          tue: ['08:00', '22:00'],
          wed: ['08:00', '22:00'],
          thu: ['08:00', '22:00'],
          fri: ['08:00', '22:00'],
          sat: ['09:00', '23:00'],
          sun: ['09:00', '23:00'],
        },
      },
    });
  }

  // ─── 3. Volunteers ─────────────────────────────────────────────────────────
  console.info('Seeding Volunteers...');
  const volunteersData = [
    {
      email: 'volunteer1@foodbridge.com',
      fullName: 'Rahul Sharma',
      vehicleType: 'bike',
      maxLoadKg: 20,
      lat: 19.0400,
      lng: 72.8550,
      isAvailable: true,
    },
    {
      email: 'volunteer2@foodbridge.com',
      fullName: 'Priya Patel',
      vehicleType: 'car',
      maxLoadKg: 100,
      lat: 19.0750,
      lng: 72.8850,
      isAvailable: true,
    },
  ];

  for (const item of volunteersData) {
    let userId = '';
    const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = listUsers?.users.find((u) => u.email === item.email);

    if (existing) {
      userId = existing.id;
    } else {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: item.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });
      if (authError || !authUser.user) {
        console.error(`Failed to create Supabase auth user for ${item.email}:`, authError?.message);
        continue;
      }
      userId = authUser.user.id;
    }

    const user = await prisma.user.create({
      data: {
        id: userId,
        email: item.email,
        full_name: item.fullName,
        role: 'volunteer',
        is_verified: true,
      },
    });

    await prisma.volunteer.create({
      data: {
        user_id: user.id,
        vehicle_type: item.vehicleType,
        max_load_kg: item.maxLoadKg,
        latitude: item.lat,
        longitude: item.lng,
        is_available: item.isAvailable,
      },
    });
  }

  console.info('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
