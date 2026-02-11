import type { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getJobRoles(req: Request, res: Response): Promise<void> {
  try {
    const jobRoles = await prisma.jobRole.findMany({
      where: {
        status: {
          statusName: 'open',
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
