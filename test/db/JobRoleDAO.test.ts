import { describe, expect, it, vi } from 'vitest';
import { JobRoleDAO } from '../../src/db/JobRoleDAO.js';
import type { PrismaClient } from '@prisma/client';

describe('JobRoleDAO', () => {
  describe('getJobRoles', () => {
    it('should call prisma.jobRole.findMany with correct parameters', async () => {
      const mockJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Engineer',
          locations: [{ location: { locationName: 'London' } }],
          capability: { capabilityName: 'Engineering' },
          band: { bandName: 'Mid' },
          closingDate: new Date('2026-03-15'),
        },
      ];

      const mockPrisma = {
        jobRole: {
          findMany: vi.fn().mockResolvedValue(mockJobRoles),
        },
      } as unknown as PrismaClient;

      const dao = new JobRoleDAO(mockPrisma);
      const result = await dao.getJobRoles();

      expect(mockPrisma.jobRole.findMany).toHaveBeenCalledWith({
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

      expect(result).toEqual(mockJobRoles);
    });

    it('should return empty array when no job roles found', async () => {
      const mockPrisma = {
        jobRole: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      } as unknown as PrismaClient;

      const dao = new JobRoleDAO(mockPrisma);
      const result = await dao.getJobRoles();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      const mockPrisma = {
        jobRole: {
          findMany: vi.fn().mockRejectedValue(mockError),
        },
      } as unknown as PrismaClient;

      const dao = new JobRoleDAO(mockPrisma);

      await expect(dao.getJobRoles()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
