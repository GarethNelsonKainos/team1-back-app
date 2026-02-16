import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { generateToken } from '../src/utils/jwt.utils';

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

const mockCreatedJobRole = {
  jobRoleId: 3,
  roleName: 'QA Engineer',
  locations: [{ location: { locationName: 'Belfast' } }],
  capability: { capabilityName: 'Quality' },
  band: { bandName: 'Senior' },
  closingDate: new Date('2026-05-01'),
  status: { statusName: 'Open' },
  description: 'Test systems and automation',
  responsibilities: 'Write tests',
  jobSpecLink: 'https://example.com/spec',
  openPositions: 2,
};

// Mock the Prisma client before importing the app
vi.mock('../src/db/prisma.js', () => ({
  prisma: {
    jobRole: {
      findMany: vi.fn().mockResolvedValue(mockJobRoles),
      findUnique: vi.fn().mockResolvedValue(mockJobRoles[0]),
      create: vi.fn().mockResolvedValue(mockCreatedJobRole),
    },
  } as unknown as Partial<PrismaClient>,
}));

let app: Express;

beforeAll(async () => {
  // Import the app after the mock is set up
  const appModule = await import('../src/index.js');
  app = appModule.default;
});

describe('Job Role Integration Tests', () => {
  describe('GET /api/job-roles', () => {
    it('should return a list of job roles', async () => {
      const token = generateToken({
        userId: 10,
        email: 'applicant@example.com',
        userTypeId: 1,
        firstName: 'Applicant',
        lastName: 'User',
      });
      const response = await request(app)
        .get('/api/job-roles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return job roles with correct structure', async () => {
      const token = generateToken({
        userId: 10,
        email: 'applicant@example.com',
        userTypeId: 1,
        firstName: 'Applicant',
        lastName: 'User',
      });
      const response = await request(app)
        .get('/api/job-roles')
        .set('Authorization', `Bearer ${token}`);

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
      const token = generateToken({
        userId: 10,
        email: 'applicant@example.com',
        userTypeId: 1,
        firstName: 'Applicant',
        lastName: 'User',
      });
      const response = await request(app)
        .get('/api/job-roles')
        .set('Authorization', `Bearer ${token}`);

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

  describe('POST /api/job-roles', () => {
    it('should return 401 without a token', async () => {
      const response = await request(app)
        .post('/api/job-roles')
        .send({ roleName: 'QA Engineer' });

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      const token = generateToken({
        userId: 11,
        email: 'applicant@example.com',
        userTypeId: 1,
        firstName: 'Applicant',
        lastName: 'User',
      });

      const response = await request(app)
        .post('/api/job-roles')
        .set('Authorization', `Bearer ${token}`)
        .send({ roleName: 'QA Engineer' });

      expect(response.status).toBe(403);
    });

    it('should create a job role for admin users', async () => {
      const token = generateToken({
        userId: 12,
        email: 'admin@example.com',
        userTypeId: 2,
        firstName: 'Admin',
        lastName: 'User',
      });

      const response = await request(app)
        .post('/api/job-roles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roleName: 'QA Engineer',
          capabilityId: 1,
          bandId: 2,
          closingDate: '2026-05-01',
          jobRoleStatusId: 1,
          jobSpecLink: 'https://example.com/spec',
          openPositions: 2,
          description: 'Test systems and automation',
          responsibilities: 'Write tests',
          locationIds: [1],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('jobRoleId', 3);
      expect(response.body).toHaveProperty('roleName', 'QA Engineer');
    });
  });
});
