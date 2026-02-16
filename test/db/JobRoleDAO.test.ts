import type { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobRoleDAO } from '../../src/db/JobRoleDAO';

describe('JobRoleDAO - New Methods', () => {
  let jobRoleDAO: JobRoleDAO;
  let mockPrisma: {
    jobRole: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    jobRoleStatus: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    jobRoleLocation: {
      createMany: ReturnType<typeof vi.fn>;
    };
    band: {
      findMany: ReturnType<typeof vi.fn>;
    };
    capability: {
      findMany: ReturnType<typeof vi.fn>;
    };
    location: {
      findMany: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockPrisma = {
      jobRole: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      jobRoleStatus: {
        findUnique: vi.fn(),
      },
      jobRoleLocation: {
        createMany: vi.fn(),
      },
      band: {
        findMany: vi.fn(),
      },
      capability: {
        findMany: vi.fn(),
      },
      location: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(mockPrisma)),
    };
    jobRoleDAO = new JobRoleDAO(mockPrisma as unknown as PrismaClient);
  });

  describe('createJobRole', () => {
    it('should create a job role with locations', async () => {
      const mockStatus = { jobRoleStatusId: 1, statusName: 'Open' };
      const mockJobRole = {
        jobRoleId: 1,
        roleName: 'Senior Software Engineer',
        capabilityId: 1,
        bandId: 2,
        description: 'Test description',
        responsibilities: 'Test responsibilities',
        jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
        openPositions: 2,
        closingDate: new Date('2026-12-31'),
        jobRoleStatusId: 1,
      };

      mockPrisma.jobRoleStatus.findUnique.mockResolvedValue(mockStatus);
      mockPrisma.jobRole.create.mockResolvedValue(mockJobRole);
      mockPrisma.jobRoleLocation.createMany.mockResolvedValue({ count: 2 });

      const result = await jobRoleDAO.createJobRole({
        roleName: 'Senior Software Engineer',
        capabilityId: 1,
        bandId: 2,
        description: 'Test description',
        responsibilities: 'Test responsibilities',
        jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
        openPositions: 2,
        locationIds: [1, 2],
        closingDate: new Date('2026-12-31'),
      });

      expect(mockPrisma.jobRoleStatus.findUnique).toHaveBeenCalledWith({
        where: { statusName: 'Open' },
      });
      expect(mockPrisma.jobRole.create).toHaveBeenCalled();
      expect(mockPrisma.jobRoleLocation.createMany).toHaveBeenCalledWith({
        data: [
          { jobRoleId: 1, locationId: 1 },
          { jobRoleId: 1, locationId: 2 },
        ],
      });
      expect(result).toEqual(mockJobRole);
    });

    it('should throw error if Open status not found', async () => {
      mockPrisma.jobRoleStatus.findUnique.mockResolvedValue(null);

      await expect(
        jobRoleDAO.createJobRole({
          roleName: 'Test Role',
          capabilityId: 1,
          bandId: 1,
          description: 'Test',
          responsibilities: 'Test',
          jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
          openPositions: 1,
          locationIds: [1],
          closingDate: new Date('2026-12-31'),
        }),
      ).rejects.toThrow('Open status not found in database');
    });
  });

  describe('getBands', () => {
    it('should return all bands ordered by name', async () => {
      const mockBands = [
        { bandId: 1, bandName: 'Associate' },
        { bandId: 2, bandName: 'Senior Associate' },
      ];
      mockPrisma.band.findMany.mockResolvedValue(mockBands);

      const result = await jobRoleDAO.getBands();

      expect(mockPrisma.band.findMany).toHaveBeenCalledWith({
        orderBy: { bandName: 'asc' },
      });
      expect(result).toEqual(mockBands);
    });
  });

  describe('getCapabilities', () => {
    it('should return all capabilities ordered by name', async () => {
      const mockCapabilities = [
        { capabilityId: 1, capabilityName: 'Engineering' },
        { capabilityId: 2, capabilityName: 'Data' },
      ];
      mockPrisma.capability.findMany.mockResolvedValue(mockCapabilities);

      const result = await jobRoleDAO.getCapabilities();

      expect(mockPrisma.capability.findMany).toHaveBeenCalledWith({
        orderBy: { capabilityName: 'asc' },
      });
      expect(result).toEqual(mockCapabilities);
    });
  });

  describe('getLocations', () => {
    it('should return all locations ordered by name', async () => {
      const mockLocations = [
        {
          locationId: 1,
          locationName: 'Belfast',
          city: 'Belfast',
          country: 'UK',
        },
        {
          locationId: 2,
          locationName: 'London',
          city: 'London',
          country: 'UK',
        },
      ];
      mockPrisma.location.findMany.mockResolvedValue(mockLocations);

      const result = await jobRoleDAO.getLocations();

      expect(mockPrisma.location.findMany).toHaveBeenCalledWith({
        orderBy: { locationName: 'asc' },
      });
      expect(result).toEqual(mockLocations);
    });
  });
});
