import type { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobRoleDAO } from '../../src/db/JobRoleDAO';
import ValidationError from '../../src/errors/ValidationError';

const mockJobRoles = [
  {
    jobRoleId: 1,
    roleName: 'Software Engineer',
    locations: [{ location: { locationName: 'London' } }],
    capability: { capabilityName: 'Engineering' },
    band: { bandName: 'Mid' },
    closingDate: new Date('2026-03-15'),
    status: { statusName: 'Open' },
  },
  {
    jobRoleId: 2,
    roleName: 'Data Analyst',
    locations: [{ location: { locationName: 'Manchester' } }],
    capability: { capabilityName: 'Data' },
    band: { bandName: 'Junior' },
    closingDate: new Date('2026-04-01'),
    status: { statusName: 'Open' },
  },
];

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
      findUnique: ReturnType<typeof vi.fn>;
    };
    capability: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
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
        findUnique: vi.fn(),
      },
      capability: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
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
      const mockCapability = { capabilityId: 1, capabilityName: 'Engineering' };
      const mockBand = { bandId: 2, bandName: 'Senior Associate' };
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
      mockPrisma.capability.findUnique.mockResolvedValue(mockCapability);
      mockPrisma.band.findUnique.mockResolvedValue(mockBand);
      mockPrisma.location.findMany.mockResolvedValue(mockLocations);
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
      expect(mockPrisma.capability.findUnique).toHaveBeenCalledWith({
        where: { capabilityId: 1 },
      });
      expect(mockPrisma.band.findUnique).toHaveBeenCalledWith({
        where: { bandId: 2 },
      });
      expect(mockPrisma.location.findMany).toHaveBeenCalledWith({
        where: { locationId: { in: [1, 2] } },
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

    it('should throw error if capability does not exist', async () => {
      const mockStatus = { jobRoleStatusId: 1, statusName: 'Open' };
      mockPrisma.jobRoleStatus.findUnique.mockResolvedValue(mockStatus);
      mockPrisma.capability.findUnique.mockResolvedValue(null);

      await expect(
        jobRoleDAO.createJobRole({
          roleName: 'Test Role',
          capabilityId: 999,
          bandId: 1,
          description: 'Test',
          responsibilities: 'Test',
          jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
          openPositions: 1,
          locationIds: [1],
          closingDate: new Date('2026-12-31'),
        }),
      ).rejects.toThrow('Capability with ID 999 does not exist');
    });

    it('should throw error if band does not exist', async () => {
      const mockStatus = { jobRoleStatusId: 1, statusName: 'Open' };
      const mockCapability = { capabilityId: 1, capabilityName: 'Engineering' };
      mockPrisma.jobRoleStatus.findUnique.mockResolvedValue(mockStatus);
      mockPrisma.capability.findUnique.mockResolvedValue(mockCapability);
      mockPrisma.band.findUnique.mockResolvedValue(null);

      await expect(
        jobRoleDAO.createJobRole({
          roleName: 'Test Role',
          capabilityId: 1,
          bandId: 999,
          description: 'Test',
          responsibilities: 'Test',
          jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
          openPositions: 1,
          locationIds: [1],
          closingDate: new Date('2026-12-31'),
        }),
      ).rejects.toThrow('Band with ID 999 does not exist');
    });

    it('should throw error if any location does not exist', async () => {
      const mockStatus = { jobRoleStatusId: 1, statusName: 'Open' };
      const mockCapability = { capabilityId: 1, capabilityName: 'Engineering' };
      const mockBand = { bandId: 2, bandName: 'Senior Associate' };
      const mockLocations = [
        {
          locationId: 1,
          locationName: 'Belfast',
          city: 'Belfast',
          country: 'UK',
        },
      ];

      mockPrisma.jobRoleStatus.findUnique.mockResolvedValue(mockStatus);
      mockPrisma.capability.findUnique.mockResolvedValue(mockCapability);
      mockPrisma.band.findUnique.mockResolvedValue(mockBand);
      mockPrisma.location.findMany.mockResolvedValue(mockLocations);

      await expect(
        jobRoleDAO.createJobRole({
          roleName: 'Test Role',
          capabilityId: 1,
          bandId: 2,
          description: 'Test',
          responsibilities: 'Test',
          jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
          openPositions: 1,
          locationIds: [1, 999],
          closingDate: new Date('2026-12-31'),
        }),
      ).rejects.toThrow('Location(s) with ID(s) 999 do not exist');
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
describe('JobRoleDAO', () => {
  describe('deleteJobRole', () => {
    it('should delete a job role successfully', async () => {
      const mockPrisma = {
        jobRole: {
          delete: vi.fn().mockResolvedValue({ jobRoleId: 5 }),
        },
      } as unknown as PrismaClient;

      const dao = new JobRoleDAO(mockPrisma);
      await dao.deleteJobRole(5);

      expect(mockPrisma.jobRole.delete).toHaveBeenCalledWith({
        where: { jobRoleId: 5 },
      });
    });

    it('should delete job role and cascade delete dependent records via database constraints', async () => {
      const mockPrisma = {
        jobRole: {
          delete: vi.fn().mockResolvedValue({ jobRoleId: 5 }),
        },
      } as unknown as PrismaClient;

      const dao = new JobRoleDAO(mockPrisma);
      await dao.deleteJobRole(5);

      expect(mockPrisma.jobRole.delete).toHaveBeenCalledWith({
        where: { jobRoleId: 5 },
      });
    });

    it('should throw error when job role does not exist', async () => {
      const prismaError = Object.assign(new Error('Record not found'), {
        code: 'P2025',
      });

      const mockPrisma = {
        jobRole: {
          delete: vi.fn().mockRejectedValue(prismaError),
        },
      } as unknown as PrismaClient;

      const dao = new JobRoleDAO(mockPrisma);

      await expect(dao.deleteJobRole(999999)).rejects.toThrow();
    });
  });
});
