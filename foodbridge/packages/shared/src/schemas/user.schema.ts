import { z } from 'zod';

// ─── User role (matches users.role CHECK constraint exactly) ──────────────────
export const UserRoleSchema = z.enum(['donor', 'ngo', 'volunteer', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// ─── POST /auth/register ──────────────────────────────────────────────────────
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1).max(100),
  phone: z.string().optional(),
  role: UserRoleSchema,
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// ─── POST /auth/login ─────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Org types (matches donors.org_type CHECK constraint exactly) ──────────────
export const OrgTypeSchema = z.enum(['restaurant', 'hostel', 'event', 'catering', 'other']);
export type OrgType = z.infer<typeof OrgTypeSchema>;

// ─── Vehicle types (matches volunteers.vehicle_type CHECK constraint exactly) ──
export const VehicleTypeSchema = z.enum(['bike', 'car', 'van', 'cycle', 'walk']);
export type VehicleType = z.infer<typeof VehicleTypeSchema>;
