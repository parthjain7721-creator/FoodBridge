import { z } from 'zod';

// ─── Donation status (matches schema CHECK constraint exactly) ─────────────────
export const DonationStatusSchema = z.enum([
  'pending',
  'ai_processing',
  'matched',
  'pickup_assigned',
  'in_transit',
  'delivered',
  'cancelled',
  'expired',
  'rejected',
]);

export type DonationStatus = z.infer<typeof DonationStatusSchema>;

// ─── Food item (matches donations.food_items JSONB structure) ──────────────────
export const FoodItemSchema = z.object({
  name: z.string().min(1),
  qty_kg: z.number().positive(),
  veg: z.boolean(),
});

export type FoodItem = z.infer<typeof FoodItemSchema>;

// ─── POST /donations request body (TRD Section 3) ─────────────────────────────
export const CreateDonationSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  food_items: z.array(FoodItemSchema).min(1),
  total_quantity_kg: z.number().positive(),
  prepared_at: z.string().datetime(),
  available_from: z.string().datetime(),
  available_until: z.string().datetime(),
  pickup_address: z.string().optional(),
  pickup_lat: z.number().min(-90).max(90),
  pickup_lng: z.number().min(-180).max(180),
  is_veg: z.boolean().default(true),
  // Fix: z.array().optional().default([]) causes a Zod type conflict — optional()
  // returns ZodOptional which then wraps ZodDefault incorrectly.
  // Correct pattern: use default([]) directly (no .optional() before .default())
  contains_allergens: z.array(z.string()).default([]),
});

export type CreateDonationInput = z.infer<typeof CreateDonationSchema>;

// ─── PATCH /donations/:id/status ──────────────────────────────────────────────
export const UpdateDonationStatusSchema = z.object({
  status: DonationStatusSchema,
});

export type UpdateDonationStatusInput = z.infer<typeof UpdateDonationStatusSchema>;

// ─── POST /ai/assess-quality request body ─────────────────────────────────────
export const AssessQualitySchema = z.object({
  donation_id: z.string().uuid(),
  image_paths: z.array(z.string()).min(1),
});

export type AssessQualityInput = z.infer<typeof AssessQualitySchema>;

// ─── AI quality assessment result ─────────────────────────────────────────────
// Fix: QualityGradeSchema only contains A|B|C|UNSAFE (what Gemini returns).
// 'unrated' is a DB-level value (ai_quality_grade column CHECK constraint in schema.md)
// and is a separate concept — added UnratedQualityGrade for DB type.
export const QualityGradeSchema = z.enum(['A', 'B', 'C', 'UNSAFE']);
export type QualityGrade = z.infer<typeof QualityGradeSchema>;

// 'unrated' is the DB default before AI processes the image
export type AIQualityGrade = QualityGrade | 'unrated';

export const AssessmentResultSchema = z.object({
  quality_grade: QualityGradeSchema,
  shelf_life_hours: z.number().int().nonnegative(),
  confidence: z.number().min(0).max(1),
  observations: z.string(),
  red_flags: z.array(z.string()),
});

export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;

// ─── POST /ai/compute-score request body ──────────────────────────────────────
export const ComputeScoreSchema = z.object({
  donation_id: z.string().uuid(),
  ngo_id: z.string().uuid(),
});

export type ComputeScoreInput = z.infer<typeof ComputeScoreSchema>;

// ─── PATCH /match/:id/respond ─────────────────────────────────────────────────
export const MatchRespondSchema = z.object({
  action: z.enum(['accept', 'reject']),
  rejection_reason: z.string().optional(),
});

export type MatchRespondInput = z.infer<typeof MatchRespondSchema>;
