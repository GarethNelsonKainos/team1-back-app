import type { PrismaClient } from '../generated/prisma/client.js';

interface Location {
  locationName: string;
}

interface JobRoleLocation {
  location: Location;
}

interface Capability {
  capabilityName: string;
}

interface Band {
  bandName: string;
}

interface RawJobRole {
  jobRoleId: number;
  roleName: string;
  locations: JobRoleLocation[];
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
export type { RawJobRole, JobRoleLocation, Capability, Band, Location };
