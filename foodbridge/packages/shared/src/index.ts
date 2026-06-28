// FoodBridge — Shared package barrel export
// All Zod schemas and TypeScript types shared between apps/api and apps/web

// Export Zod schemas (validators)
export * from './schemas/donation.schema';
export * from './schemas/user.schema';

// Export TypeScript interfaces — NOTE: types/index.ts re-exports the schema
// types above, so we only export the *new* interface declarations from it to
// avoid "Duplicate export" / ambiguous re-export TS errors.
export type {
  User,
  Donor,
  NGO,
  Volunteer,
  Donation,
  ScoreBreakdown,
  DeliveryStatus,
  Delivery,
  Notification,
  ImpactMetrics,
  ApiResponse,
  PaginatedResponse,
} from './types/index';
