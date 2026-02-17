import type { PrismaClient } from '@prisma/client';
import type { Band } from '../models/Band';
import type { Capability } from '../models/Capability';
import type { JobRoleStatus } from '../models/JobRoleStatus';
import type { Location } from '../models/Location';

interface RawJobRole {
  jobRoleId: number;
  roleName: string;
  locations: { location: Location }[];
  capability: Capability;
  band: Band;
  closingDate: Date;
  description?: string | null;
  responsibilities?: string | null;
  jobSpecLink?: string | null;
  status?: JobRoleStatus | null;
  openPositions?: number | null;
}

class JobRoleDAO {
  constructor(private prisma: PrismaClient) {}

  async getJobRoles(): Promise<RawJobRole[]> {
    return await this.prisma.jobRole.findMany({
      where: {
        status: {
          statusName: 'Open',
        },
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
  }

  async getJobRoleById(id: number): Promise<RawJobRole | null> {
    return await this.prisma.jobRole.findUnique({
      where: { jobRoleId: id },
      include: {
        capability: true,
        band: true,
        locations: {
          include: {
            location: true,
          },
        },
        status: true,
      },
    });
  }

  /**
   * Deletes a job role and all associated applications in a transaction (hard delete).
   * Throws if the job role does not exist.
   */
  async deleteJobRole(id: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Delete all applications for this job role
      await tx.application.deleteMany({ where: { jobRoleId: id } });
      // Delete the job role itself
      await tx.jobRole.delete({ where: { jobRoleId: id } });
    });
  }
}

export { JobRoleDAO };
export type { RawJobRole };
