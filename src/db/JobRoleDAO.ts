import type { Prisma, PrismaClient } from '@prisma/client';
import type { Band } from '../models/Band.js';
import type { Capability } from '../models/Capability.js';
import type { Location } from '../models/Location.js';

interface RawJobRole {
  jobRoleId: number;
  roleName: string;
  locations: { location: Location }[]; // inline shape for Prisma result
  capability: Capability;
  band: Band;
  closingDate: Date;
}

interface CreateJobRoleInput {
  roleName: string;
  capabilityId: number;
  bandId: number;
  closingDate: Date;
  jobRoleStatusId: number;
  locationIds?: number[];
}

type JobRoleWithDetails = Prisma.JobRoleGetPayload<{
  include: {
    capability: true;
    band: true;
    status: true;
    locations: { include: { location: true } };
  };
}>;

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

  async createJobRole(input: CreateJobRoleInput): Promise<JobRoleWithDetails> {
    const {
      roleName,
      capabilityId,
      bandId,
      closingDate,
      jobRoleStatusId,
      locationIds,
    } = input;

    return await this.prisma.jobRole.create({
      data: {
        roleName,
        capabilityId,
        bandId,
        closingDate,
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
  }
}

export { JobRoleDAO };
export type { CreateJobRoleInput, JobRoleWithDetails, RawJobRole };
