import type { PrismaClient } from '@prisma/client';
import type { Band } from '../models/Band.js';
import type { Capability } from '../models/Capability.js';
import type { JobRoleStatus } from '../models/JobRoleStatus.js';
import type { Location } from '../models/Location.js';
import type { CreateJobRoleInput } from '../services/JobRoleService.js';

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

  async createJobRole(data: CreateJobRoleInput): Promise<RawJobRole> {
    const {
      roleName,
      capabilityId,
      bandId,
      closingDate,
      jobRoleStatusId,
      jobSpecLink,
      openPositions,
      description,
      responsibilities,
      locationIds,
    } = data;

    const createData = {
      roleName,
      capabilityId,
      bandId,
      closingDate,
      jobRoleStatusId,
      jobSpecLink,
      openPositions,
      description,
      responsibilities,
      locations: {
        create: locationIds.map((locationId) => ({
          location: {
            connect: { locationId },
          },
        })),
      },
    };

    return await this.prisma.jobRole.create({
      data: createData,
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
}

export { JobRoleDAO };
export type { RawJobRole };
