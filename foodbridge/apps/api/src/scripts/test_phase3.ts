// FoodBridge — Phase 3 & 4 End-to-End Verification Script
// Tests matching, routing, notification dispatch, response, and delivery confirmation.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api/v1';

async function main() {
  console.log('=== STARTING PHASE 3 & 4 E2E TEST ===');

  // 1. Fetch test donor, NGO, and volunteer
  const donor = await prisma.donor.findFirst();
  const ngo = await prisma.nGO.findFirst();
  const volunteer = await prisma.volunteer.findFirst();

  if (!donor || !ngo || !volunteer) {
    console.error('Error: Make sure database is seeded before running tests.');
    process.exit(1);
  }

  // Fetch corresponding User records to get correct email addresses
  const donorUser = await prisma.user.findUnique({ where: { id: donor.user_id } });
  const ngoUser = await prisma.user.findUnique({ where: { id: ngo.user_id } });
  const volunteerUser = await prisma.user.findUnique({ where: { id: volunteer.user_id } });

  if (!donorUser || !ngoUser || !volunteerUser) {
    console.error('Error: Associated user records not found.');
    process.exit(1);
  }

  const donorEmail = donorUser.email;
  const ngoEmail = ngoUser.email;
  const volunteerEmail = volunteerUser.email;

  console.log(`Donor: ${donor.org_name} (ID: ${donor.id}, Email: ${donorEmail})`);
  console.log(`NGO: ${ngo.org_name} (ID: ${ngo.id}, Email: ${ngoEmail})`);
  console.log(`Volunteer: ${volunteer.user_id} (ID: ${volunteer.id}, Email: ${volunteerEmail})`);

  // Ensure volunteer is available
  await prisma.volunteer.update({
    where: { id: volunteer.id },
    data: { is_available: true },
  });

  // 2. Register / Login to get auth token
  // Let's sign in as donor
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: donorEmail,
      password: 'Password123!',
    }),
  });

  const loginData: any = await loginRes.json();
  if (!loginRes.ok) {
    console.error('Failed to log in as donor:', loginData.error);
    process.exit(1);
  }
  const token = loginData.token;
  const authHeader = `Bearer ${token}`;

  // 3. Create a test donation
  console.log('\n--- Creating Donation ---');
  const createDonationRes = await fetch(`${API_URL}/donations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      title: 'Lunch Buffet Surplus',
      description: 'Edible mixed lunch buffet left overs',
      food_items: [{ name: 'Rice & Curry', qty_kg: 15.0, veg: true }],
      total_quantity_kg: 15.0,
      prepared_at: new Date().toISOString(),
      available_from: new Date().toISOString(),
      available_until: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4 hours from now
      pickup_address: donor.address,
      pickup_lat: Number(donor.latitude),
      pickup_lng: Number(donor.longitude),
      is_veg: true,
      contains_allergens: [],
    }),
  });

  const donationData: any = await createDonationRes.json();
  if (!createDonationRes.ok) {
    console.error('Failed to create donation:', donationData);
    process.exit(1);
  }
  const donationId = donationData.id;
  console.log(`Donation created with ID: ${donationId}`);

  // 4. Run AI Assessment & Scoring
  console.log('\n--- Running Quality Assessment ---');
  const qualityRes = await fetch(`${API_URL}/ai/assess-quality`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      donation_id: donationId,
      image_paths: ['food-images/sample/img1.jpg'],
    }),
  });
  const qualityData: any = await qualityRes.json();
  if (!qualityRes.ok) {
    console.error('Failed quality assessment:', qualityData);
    process.exit(1);
  }
  console.log('Quality Grade:', qualityData.quality_grade, `(${qualityData.confidence * 100}% confidence)`);

  console.log('\n--- Computing Safety Score ---');
  const scoreRes = await fetch(`${API_URL}/ai/compute-score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      donation_id: donationId,
    }),
  });
  const scoreData: any = await scoreRes.json();
  if (!scoreRes.ok) {
    console.error('Failed score computation:', scoreData);
    process.exit(1);
  }
  console.log('Safety Score:', scoreData.safety_score, '-', scoreData.recommendation);

  // 5. Find NGO matches
  console.log('\n--- Finding NGO Matches ---');
  const matchRes = await fetch(`${API_URL}/match/find-ngos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      donation_id: donationId,
      radius_km: 25,
    }),
  });
  const matchData: any = await matchRes.json();
  if (!matchRes.ok) {
    console.error('Failed to find NGO matches:', matchData);
    process.exit(1);
  }
  console.log(`Found ${matchData.matches.length} matches:`);
  matchData.matches.forEach((m: any) => {
    console.log(`- ${m.org_name}: Score ${m.match_score}, Distance ${m.distance_km} km`);
  });

  // 6. Notify matches
  console.log('\n--- Dispatching Notifications ---');
  const notifyRes = await fetch(`${API_URL}/match/notify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      donation_id: donationId,
    }),
  });
  const notifyData: any = await notifyRes.json();
  if (!notifyRes.ok) {
    console.error('Failed to notify matches:', notifyData);
    process.exit(1);
  }
  console.log(notifyData.message);

  // 7. NGO accepts match
  console.log('\n--- NGO Accepting Match ---');
  // Log in as NGO to get their token
  const ngoLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ngoEmail,
      password: 'Password123!',
    }),
  });
  const ngoLoginData: any = await ngoLoginRes.json();
  if (!ngoLoginRes.ok) {
    console.error('Failed to log in as NGO:', ngoLoginData);
    process.exit(1);
  }
  const ngoToken = ngoLoginData.token;
  const ngoAuthHeader = `Bearer ${ngoToken}`;

  // Get NGO's matches list
  const getMatchesRes = await fetch(`${API_URL}/auth/matches?ngo_id=${ngo.id}`, {
    headers: { Authorization: ngoAuthHeader },
  });
  if (!getMatchesRes.ok) {
    console.error('Failed to get NGO matches:', await getMatchesRes.text());
    process.exit(1);
  }
  const ngoMatches: any = await getMatchesRes.json();
  const activeMatch = ngoMatches.find((m: any) => m.donation_id === donationId && m.status === 'pending');

  if (!activeMatch) {
    console.error('Could not find pending match for NGO');
    process.exit(1);
  }

  const respondRes = await fetch(`${API_URL}/match/${activeMatch.id}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ngoAuthHeader,
    },
    body: JSON.stringify({
      status: 'accepted',
    }),
  });
  const respondData: any = await respondRes.json();
  if (!respondRes.ok) {
    console.error('Failed to respond to match:', respondData);
    process.exit(1);
  }
  console.log(respondData.message);
  const deliveryId = respondData.delivery_id;
  console.log('Initialized Delivery ID:', deliveryId);

  // 8. Generate Route
  console.log('\n--- Generating Route ---');
  const routeRes = await fetch(`${API_URL}/routes/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      delivery_id: deliveryId,
    }),
  });
  const routeData: any = await routeRes.json();
  if (!routeRes.ok) {
    console.error('Failed to generate route:', routeData);
    process.exit(1);
  }
  console.log(`Route generated: Distance = ${routeData.distance_km} km, Duration = ${routeData.est_duration_mins} mins`);

  // 9. Volunteer confirms Pickup
  console.log('\n--- Volunteer Confirming Pickup ---');
  // Log in as volunteer
  const volLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: volunteerEmail,
      password: 'Password123!',
    }),
  });
  const volLoginData: any = await volLoginRes.json();
  if (!volLoginRes.ok) {
    console.error('Failed to log in as volunteer:', volLoginData);
    process.exit(1);
  }
  const volToken = volLoginData.token;
  const volAuthHeader = `Bearer ${volToken}`;

  const pickupRes = await fetch(`${API_URL}/deliveries/${deliveryId}/pickup`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: volAuthHeader,
    },
    body: JSON.stringify({
      pickup_photo_url: 'delivery-proofs/pickup-1.jpg',
    }),
  });
  const pickupData: any = await pickupRes.json();
  if (!pickupRes.ok) {
    console.error('Failed to confirm pickup:', pickupData);
    process.exit(1);
  }
  console.log(pickupData.message);

  // 10. Volunteer confirms Delivery dropoff
  console.log('\n--- Volunteer Confirming Dropoff ---');
  const deliverRes = await fetch(`${API_URL}/deliveries/${deliveryId}/deliver`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: volAuthHeader,
    },
    body: JSON.stringify({
      delivery_photo_url: 'delivery-proofs/deliver-1.jpg',
      rating_by_ngo: 5,
    }),
  });
  const deliverData: any = await deliverRes.json();
  if (!deliverRes.ok) {
    console.error('Failed to confirm dropoff:', deliverData);
    process.exit(1);
  }
  console.log(deliverData.message);

  // 11. Verify NGO Load update and donor impact update
  console.log('\n--- Verifying Database Stats Updates ---');
  const updatedNgo = await prisma.nGO.findUnique({ where: { id: ngo.id } });
  const updatedDonor = await prisma.donor.findUnique({ where: { id: donor.id } });

  console.log(`NGO Load updated: ${ngo.current_load_kg} kg -> ${updatedNgo?.current_load_kg} kg`);
  console.log(`Donor Impact Score updated: ${donor.impact_score} -> ${updatedDonor?.impact_score}`);
  console.log(`Donor Total Kg Donated: ${donor.total_kg_donated} -> ${updatedDonor?.total_kg_donated}`);

  console.log('\n=== E2E TEST COMPLETED SUCCESSFULLY! ===');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
