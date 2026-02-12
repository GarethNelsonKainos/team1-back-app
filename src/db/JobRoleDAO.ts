import type { PrismaClient } from '@prisma/client';
import type { Location } from '../models/Location';
import type { Capability } from '../models/Capability';
import type { Band } from '../models/Band';

interface RawJobRole {
  jobRoleId: number;
  roleName: string;
  locations: { location: Location }[];  // inline shape for Prisma result
  capability: Capability;
  band: Band;
  closingDate: Date;
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
        locations: {
          include: {
            location: true,
          },
        },
      },
    });
  }
}

export { JobRoleDAO };
export type { RawJobRole };
