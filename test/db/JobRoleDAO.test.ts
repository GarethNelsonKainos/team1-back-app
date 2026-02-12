import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const mockJobRoles = [
  {
    jobRoleId: 1,
    roleName: 'Software Engineer',
    locations: [{ location: { locationName: 'London' } }],
    capability: { capabilityName: 'Engineering' },
    band: { bandName: 'Mid' },
    closingDate: new Date('2026-03-15'),
  },
  {
    jobRoleId: 2,
    roleName: 'Data Analyst',
    locations: [{ location: { locationName: 'Manchester' } }],
    capability: { capabilityName: 'Data' },
    band: { bandName: 'Junior' },
    closingDate: new Date('2026-04-01'),
  },
];

// Mock the Prisma client before importing the app
vi.mock('../src/db/prisma.js', () => ({
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
