// test/jobrole.routes.test.ts

import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../src/config/database';
import app from '../src/index';
import { generateToken } from '../src/utils/jwt.utils';

vi.mock('../src/config/database', () => ({
  prisma: {
    jobRole: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Job Roles Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('GET /api/job-roles', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/job-roles');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'No token provided' });
    });

    it('should return 200 with valid applicant token', async () => {
      const mockJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Test Role',
          capabilityId: 1,
          bandId: 1,
          closingDate: new Date('2026-12-31'),
          jobRoleStatusId: 1,
          capability: { capabilityId: 1, capabilityName: 'Engineering' },
          band: { bandId: 1, bandName: 'Band A' },
          status: { jobRoleStatusId: 1, statusName: 'Open' },
          locations: [],
        },
      ];

      vi.mocked(prisma.jobRole.findMany).mockResolvedValueOnce(
        mockJobRoles as unknown[],
      );

      const token = generateToken({
        userId: 1,
        email: 'applicant@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'Applicant',
      });

      const response = await request(app)
        .get('/api/job-roles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 200 with valid admin token', async () => {
      const mockJobRoles: unknown[] = [];
      vi.mocked(prisma.jobRole.findMany).mockResolvedValueOnce(mockJobRoles);

      const token = generateToken({
        userId: 2,
        email: 'admin@example.com',
        userTypeId: 2,
        firstName: 'Admin',
        lastName: 'User',
      });

      const response = await request(app)
        .get('/api/job-roles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/job-roles')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid or expired token' });
    });
  });

  describe('POST /api/job-roles', () => {
    const jobRoleData = {
      roleName: 'Test Role',
      capabilityId: 1,
      bandId: 1,
      closingDate: '2026-12-31',
      jobRoleStatusId: 1,
      locationIds: [1],
    };

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/job-roles')
        .send(jobRoleData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'No token provided' });
    });

    it('should return 403 with applicant token', async () => {
      const token = generateToken({
        userId: 1,
        email: 'applicant@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'Applicant',
      });

      const response = await request(app)
        .post('/api/job-roles')
        .set('Authorization', `Bearer ${token}`)
        .send(jobRoleData);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Access denied. Insufficient permissions.',
      });
    });

    it('should return 400 with admin token but missing fields', async () => {
      const token = generateToken({
        userId: 2,
        email: 'admin@example.com',
        userTypeId: 2,
        firstName: 'Admin',
        lastName: 'User',
      });

      const response = await request(app)
        .post('/api/job-roles')
        .set('Authorization', `Bearer ${token}`)
        .send({ roleName: 'Incomplete' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing required fields' });
    });

    it('should return 201 with admin token and valid data', async () => {
      const token = generateToken({
        userId: 2,
        email: 'admin@example.com',
        userTypeId: 2,
        firstName: 'Admin',
        lastName: 'User',
      });

      const uniqueRoleName = `Test Role ${Date.now()}`;
      const testData = {
        ...jobRoleData,
        roleName: uniqueRoleName,
      };

      const mockCreatedJobRole = {
        jobRoleId: 7,
        roleName: uniqueRoleName,
        capabilityId: 1,
        bandId: 1,
        closingDate: new Date('2026-12-31'),
        jobRoleStatusId: 1,
        capability: { capabilityId: 1, capabilityName: 'Engineering' },
        band: { bandId: 1, bandName: 'Band A' },
        status: { jobRoleStatusId: 1, statusName: 'Open' },
        locations: [
          {
            locationId: 1,
            locationName: 'HQ',
            city: 'London',
            country: 'UK',
          },
        ],
      };

      vi.mocked(prisma.jobRole.create).mockResolvedValueOnce(
        mockCreatedJobRole as unknown,
      );

      const response = await request(app)
        .post('/api/job-roles')
        .set('Authorization', `Bearer ${token}`)
        .send(testData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('jobRoleId');
      expect(response.body).toHaveProperty('roleName', uniqueRoleName);
      expect(response.body).toHaveProperty('capability');
      expect(response.body).toHaveProperty('band');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('locations');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post('/api/job-roles')
        .set('Authorization', 'Bearer invalid.token.here')
        .send(jobRoleData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid or expired token' });
    });
  });
});
