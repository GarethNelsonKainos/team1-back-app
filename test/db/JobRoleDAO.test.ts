import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { JobRoleDAO } from '../../src/db/JobRoleDAO.js';

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

// Mock the Prisma client before importing the app
vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    jobRole: {
      findMany: vi.fn().mockResolvedValue(mockJobRoles),
    },
  } as unknown as Partial<PrismaClient>,
}));

let app: Express;

beforeAll(async () => {
  // Import the app after the mock is set up
  const appModule = await import('../../src/index.js');
  app = appModule.default;
});

describe('Job Role Integration Tests', () => {
  describe('GET /api/job-roles', () => {
    it('should return a list of job roles', async () => {
      const response = await request(app).get('/api/job-roles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return job roles with correct structure', async () => {
      const response = await request(app).get('/api/job-roles');

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        const jobRole = response.body[0];
        expect(jobRole).toHaveProperty('jobRoleId');
        expect(jobRole).toHaveProperty('roleName');
        expect(jobRole).toHaveProperty('location');
        expect(jobRole).toHaveProperty('capability');
        expect(jobRole).toHaveProperty('band');
        expect(jobRole).toHaveProperty('closingDate');
      }
    });

    it('should return job roles in correct format', async () => {
      const response = await request(app).get('/api/job-roles');

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        const jobRole = response.body[0];
        expect(typeof jobRole.jobRoleId).toBe('number');
        expect(typeof jobRole.roleName).toBe('string');
        expect(typeof jobRole.location).toBe('string');
        expect(typeof jobRole.capability).toBe('string');
        expect(typeof jobRole.band).toBe('string');
        expect(typeof jobRole.closingDate).toBe('string');
      }
    });
  });
});

describe('JobRoleDAO', () => {
  describe('deleteJobRole', () => {
    it('should delete a job role successfully', async () => {
      const mockPrisma = {
        $transaction: vi.fn(async (callback) => {
          return await callback({
            application: {
              deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
            },
            jobRole: {
              delete: vi.fn().mockResolvedValue({ jobRoleId: 5 }),
            },
          });
        }),
      } as unknown as PrismaClient;

      const dao = new JobRoleDAO(mockPrisma);
      await dao.deleteJobRole(5);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should cascade delete applications before deleting job role', async () => {
      const mockDeleteMany = vi.fn().mockResolvedValue({ count: 2 });
      const mockDelete = vi.fn().mockResolvedValue({ jobRoleId: 5 });

      const mockPrisma = {
        $transaction: vi.fn(async (callback) => {
          return await callback({
            application: { deleteMany: mockDeleteMany },
            jobRole: { delete: mockDelete },
          });
        }),
      } as unknown as PrismaClient;

      const dao = new JobRoleDAO(mockPrisma);
      await dao.deleteJobRole(5);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: { jobRoleId: 5 },
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { jobRoleId: 5 },
      });
    });

    it('should throw error when job role does not exist', async () => {
      const prismaError = Object.assign(new Error('Record not found'), {
        code: 'P2025',
      });

      const mockPrisma = {
        $transaction: vi.fn(async (callback) => {
          return await callback({
            application: {
              deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
            },
            jobRole: {
              delete: vi.fn().mockRejectedValue(prismaError),
            },
          });
        }),
      } as unknown as PrismaClient;

      const dao = new JobRoleDAO(mockPrisma);

      await expect(dao.deleteJobRole(999999)).rejects.toThrow();
    });

    it('should rollback transaction if deletion fails', async () => {
      const mockError = new Error('Database error');
      const mockDeleteMany = vi.fn().mockResolvedValue({ count: 2 });
      const mockDelete = vi.fn().mockRejectedValue(mockError);

      const mockPrisma = {
        $transaction: vi.fn(async (callback) => {
          return await callback({
            application: { deleteMany: mockDeleteMany },
            jobRole: { delete: mockDelete },
          });
        }),
      } as unknown as PrismaClient;

      const dao = new JobRoleDAO(mockPrisma);

      await expect(dao.deleteJobRole(5)).rejects.toThrow('Database error');
      expect(mockDeleteMany).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
