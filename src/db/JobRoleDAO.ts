import type { PrismaClient } from '@prisma/client';
import ValidationError from '../errors/ValidationError.js';
import type { Band } from '../models/Band.js';
import type { Capability } from '../models/Capability.js';
import type { JobRoleStatus } from '../models/JobRoleStatus.js';
import type { Location } from '../models/Location.js';

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
   * Deletes a job role (hard delete). Database cascades handle deletion of related JobRoleLocation and Application records.
   * Throws if the job role does not exist.
   */
  async deleteJobRole(id: number): Promise<void> {
    await this.prisma.jobRole.delete({ where: { jobRoleId: id } });
  }

  async createJobRole(data: {
    roleName: string;
    capabilityId: number;
    bandId: number;
    description: string;
    responsibilities: string;
    jobSpecLink: string;
    openPositions: number;
    locationIds: number[];
    closingDate: Date;
  }) {
    // Get "Open" status ID
    const openStatus = await this.prisma.jobRoleStatus.findUnique({
      where: { statusName: 'Open' },
    });

    if (!openStatus) {
      throw new Error('Open status not found in database');
    }

    // Validate that capabilityId exists
    const capability = await this.prisma.capability.findUnique({
      where: { capabilityId: data.capabilityId },
    });
    if (!capability) {
      throw new ValidationError(
        `Capability with ID ${data.capabilityId} does not exist`,
      );
    }

    // Validate that bandId exists
    const band = await this.prisma.band.findUnique({
      where: { bandId: data.bandId },
    });
    if (!band) {
      throw new ValidationError(`Band with ID ${data.bandId} does not exist`);
    }

    // Validate that all locationIds exist
    if (data.locationIds.length > 0) {
      const locations = await this.prisma.location.findMany({
        where: { locationId: { in: data.locationIds } },
      });

      if (locations.length !== data.locationIds.length) {
        const foundIds = locations.map((loc) => loc.locationId);
        const missingIds = data.locationIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new ValidationError(
          `Location(s) with ID(s) ${missingIds.join(', ')} do not exist`,
        );
      }
    }

    // Create job role with locations in transaction
    return await this.prisma.$transaction(async (tx) => {
      const jobRole = await tx.jobRole.create({
        data: {
          roleName: data.roleName,
          capabilityId: data.capabilityId,
          bandId: data.bandId,
          description: data.description,
          responsibilities: data.responsibilities,
          jobSpecLink: data.jobSpecLink,
          openPositions: data.openPositions,
          closingDate: data.closingDate,
          jobRoleStatusId: openStatus.jobRoleStatusId,
        },
      });

      // Create job role location relationships
      await tx.jobRoleLocation.createMany({
        data: data.locationIds.map((locationId) => ({
          jobRoleId: jobRole.jobRoleId,
          locationId,
        })),
      });

      return jobRole;
    });
  }

  async getBands() {
    return this.prisma.band.findMany({
      orderBy: { bandName: 'asc' },
    });
  }

  async getCapabilities() {
    return this.prisma.capability.findMany({
      orderBy: { capabilityName: 'asc' },
    });
  }

  async getLocations() {
    return this.prisma.location.findMany({
      orderBy: { locationName: 'asc' },
    });
  }
}

export { JobRoleDAO };
export type { RawJobRole };
