// FoodBridge — Shared TypeScript Types
// These mirror the Prisma-generated types for use in the frontend
// (avoids importing Prisma directly into the Next.js client bundle)

import type { DonationStatus, QualityGrade, AIQualityGrade, FoodItem } from '../schemas/donation.schema';
import type { UserRole, OrgType, VehicleType } from '../schemas/user.schema';

export type { DonationStatus, QualityGrade, AIQualityGrade, FoodItem, UserRole, OrgType, VehicleType };

// ─── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Donor ────────────────────────────────────────────────────────────────────
export interface Donor {
  id: string;
  user_id: string;
  org_name: string;
  org_type: OrgType;
  address: string;
  latitude: number;
  longitude: number;
  avg_daily_covers?: number;
  cuisine_tags?: string[];
  fssai_number?: string;
  impact_score: number;
  total_kg_donated: number;
  created_at: string;
}

// ─── NGO ──────────────────────────────────────────────────────────────────────
export interface NGO {
  id: string;
  user_id: string;
  org_name: string;
  registration_no?: string;
  address: string;
  latitude: number;
  longitude: number;
  storage_capacity_kg: number;
  current_load_kg: number;
  accepted_food_types?: string[];
  beneficiary_count?: number;
  operating_hours?: Record<string, [string, string]>;
  acceptance_rate: number;
  avg_response_time_mins?: number;
  created_at: string;
}

// ─── Volunteer ────────────────────────────────────────────────────────────────
export interface Volunteer {
  id: string;
  user_id: string;
  vehicle_type: VehicleType;
  max_load_kg: number;
  latitude?: number;
  longitude?: number;
  is_available: boolean;
  total_deliveries: number;
  rating: number;
  created_at: string;
}

// ─── Donation ─────────────────────────────────────────────────────────────────
export interface Donation {
  id: string;
  donor_id: string;
  title: string;
  description?: string;
  food_items: FoodItem[];
  total_quantity_kg: number;
  prepared_at: string;
  available_from: string;
  available_until: string;
  pickup_address?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  is_veg: boolean;
  contains_allergens?: string[];
  status: DonationStatus;
  safety_score?: number;
  score_breakdown?: ScoreBreakdown;
  ai_shelf_life_hrs?: number;
  ai_quality_grade?: AIQualityGrade;
  created_at: string;
  updated_at: string;
}

// ─── Score breakdown (matches TRD Section 4.2 computeSafetyScore factors) ─────
export interface ScoreBreakdown {
  freshness: number;
  quality: number;
  travelTime: number;
  ngoCapacity: number;
  weather: number;
  traffic: number;
  total: number;
}

// ─── Delivery ─────────────────────────────────────────────────────────────────
export type DeliveryStatus =
  | 'assigned'
  | 'en_route_pickup'
  | 'picked_up'
  | 'en_route_delivery'
  | 'delivered'
  | 'failed';

export interface Delivery {
  id: string;
  donation_id: string;
  match_id: string;
  volunteer_id: string;
  route_polyline?: string;
  distance_km?: number;
  est_duration_mins?: number;
  assigned_at: string;
  picked_up_at?: string;
  delivered_at?: string;
  pickup_photo_url?: string;
  delivery_photo_url?: string;
  ngo_confirmation: boolean;
  rating_by_ngo?: number;
  status: DeliveryStatus;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  sent_via?: string[];
  created_at: string;
}

// ─── Impact metrics ───────────────────────────────────────────────────────────
export interface ImpactMetrics {
  id: string;
  date: string;
  donations_count: number;
  kg_saved: number;
  meals_provided: number;
  co2_avoided_kg: number;
  ngos_served: number;
  volunteers_active: number;
  avg_safety_score?: number;
}

// ─── API response helpers ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
}
