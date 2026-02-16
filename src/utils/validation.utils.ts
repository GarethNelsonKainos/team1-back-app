import { z } from 'zod';

export const createJobRoleSchema = z.object({
  roleName: z
    .string()
    .min(3, 'Role name must be at least 3 characters')
    .max(100),
  capabilityId: z.number().int().positive('Invalid capability'),
  bandId: z.number().int().positive('Invalid band'),
  description: z.string().min(10).max(1000),
  responsibilities: z.string().min(10).max(2000),
  jobSpecLink: z
    .string()
    .url('Invalid SharePoint URL')
    .startsWith(
      'https://kainossoftwareltd.sharepoint.com',
      'Must be a Kainos SharePoint link',
    ),
  openPositions: z.number().int().min(1),
  locationIds: z
    .array(z.number().int().positive())
    .min(1, 'At least one location required'),
  closingDate: z.string().datetime('Invalid date format'),
});

export type CreateJobRoleInput = z.infer<typeof createJobRoleSchema>;

export function validateCreateJobRole(data: unknown): CreateJobRoleInput {
  return createJobRoleSchema.parse(data);
}
