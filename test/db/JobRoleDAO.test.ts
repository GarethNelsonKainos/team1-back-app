import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    jobRole: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { JobRoleDAO } from '../../src/db/JobRoleDAO.js';
import { prisma } from '../../src/db/prisma.js';

describe('JobRoleDAO', () => {
  let jobRoleDAO: JobRoleDAO;

  beforeEach(() => {
    vi.clearAllMocks();
    jobRoleDAO = new JobRoleDAO(prisma);
  });

  describe('getJobRoles', () => {
    it('should return all open job roles', async () => {
      const mockJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Frontend Engineer',
          closingDate: new Date('2026-02-11'),
          capability: { capabilityId: 1, name: 'Engineering' },
          band: { bandId: 1, name: 'Band A' },
          locations: [
            {
              location: { locationId: 1, name: 'HQ' },
            },
          ],
        },
      ];

      (prisma.jobRole.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockJobRoles,
      );

      const result = await jobRoleDAO.getJobRoles();

      expect(result).toEqual(mockJobRoles);
      expect(prisma.jobRole.findMany).toHaveBeenCalledWith({
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
    });

    it('should return empty array when no job roles exist', async () => {
      (prisma.jobRole.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        [],
      );

      const result = await jobRoleDAO.getJobRoles();

      expect(result).toEqual([]);
    });

    it('should throw error when database fails', async () => {
      const dbError = new Error('Database connection failed');
      (prisma.jobRole.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(
        dbError,
      );

      await expect(jobRoleDAO.getJobRoles()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('createJobRole', () => {
    it('should create and return a new job role', async () => {
      const mockCreatedRole = {
        jobRoleId: 2,
        roleName: 'Backend Engineer',
        closingDate: new Date('2026-03-15'),
        capabilityId: 1,
        bandId: 1,
        jobRoleStatusId: 1,
        capability: { capabilityId: 1, name: 'Engineering' },
        band: { bandId: 1, name: 'Band A' },
        status: { jobRoleStatusId: 1, statusName: 'Open' },
        locations: [
          {
            jobRoleLocationId: 1,
            location: { locationId: 1, name: 'Remote' },
          },
        ],
      };

      (prisma.jobRole.create as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockCreatedRole,
      );

      const inputData = {
        roleName: 'Backend Engineer',
        capabilityId: 1,
        bandId: 1,
        closingDate: new Date('2026-03-15'),
        jobRoleStatusId: 1,
        locationIds: [1],
      };

      const result = await jobRoleDAO.createJobRole(inputData);

      expect(result).toEqual(mockCreatedRole);
      expect(result.jobRoleId).toBe(2);
      expect(result.roleName).toBe('Backend Engineer');
    });

    it('should throw error when required fields are missing', async () => {
      const dbError = new Error('Foreign key constraint violated');
      (prisma.jobRole.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        dbError,
      );

      const inputData = {
        roleName: 'Test Role',
        capabilityId: 999, // non-existent
        bandId: 1,
        closingDate: new Date('2026-03-15'),
        jobRoleStatusId: 1,
      };

      await expect(jobRoleDAO.createJobRole(inputData)).rejects.toThrow(
        'Foreign key constraint violated',
      );
    });
  });
});
