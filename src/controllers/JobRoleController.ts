import type { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import type { PrismaClient } from '../generated/prisma/client.js';

class JobRoleController {
  constructor(private prisma: PrismaClient) {}

  async getJobRoles(req: Request, res: Response): Promise<void> {
    try {
      const jobRoles = await this.prisma.jobRole.findMany({
        where: {
          status: {
            statusName: 'Open',
          },
        },
        include: {
          capability: true,
          band: true,
          locations: {
            include: {
              location: true,
            },
          },
        },
      });

      const response = jobRoles.map((jr) => ({
        jobRoleId: jr.jobRoleId,
        roleName: jr.roleName,
        location: jr.locations.map((l) => l.location.locationName).join(', '),
        capability: jr.capability.capabilityName,
        band: jr.band.bandName,
        closingDate: jr.closingDate.toISOString(),
      }));

      res.json(response);
    } catch (error) {
      console.error('Error fetching job roles:', error);
      res.status(500).json({ error: 'Failed to fetch job roles' });
    }
  }
}

export { JobRoleController };
export const jobRoleController = new JobRoleController(prisma);
