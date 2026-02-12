import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { requireAdmin } from '../middleware/RBAC.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/job-roles
 * Get all job roles - accessible by both Applicant and Admin (authenticated users)
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const jobRoles = await prisma.jobRole.findMany({
      include: {
        capability: true,
        band: true,
        status: true,
        locations: {
          include: {
            location: true,
          },
        },
      },
    });

    res.json(jobRoles);
  } catch (error) {
    console.error('Get job roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/job-roles
 * Create new job role - Admin only
 */
router.post(
  '/',
  authMiddleware,
  requireAdmin(),
  async (req: Request, res: Response) => {
    try {
      const {
        roleName,
        capabilityId,
        bandId,
        closingDate,
        jobRoleStatusId,
        locationIds,
      } = req.body;

      // Basic validation
      if (
        !roleName ||
        !capabilityId ||
        !bandId ||
        !closingDate ||
        !jobRoleStatusId
      ) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const jobRole = await prisma.jobRole.create({
        data: {
          roleName,
          capabilityId,
          bandId,
          closingDate: new Date(closingDate),
          jobRoleStatusId,
          locations: locationIds
            ? {
                create: locationIds.map((locationId: number) => ({
                  locationId,
                })),
              }
            : undefined,
        },
        include: {
          capability: true,
          band: true,
          status: true,
          locations: {
            include: {
              location: true,
            },
          },
        },
      });

      res.status(201).json(jobRole);
    } catch (error) {
      console.error('Create job role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;
