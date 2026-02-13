import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/index.js';
import { generateToken } from '../src/utils/jwt.utils.js';

vi.mock('../src/db/prisma.js', () => ({
  prisma: {
    jobRole: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '../src/db/prisma.js';

describe('Job Role Integration Tests', () => {
  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();
    token = generateToken({
      userId: 1,
      email: 'admin@example.com',
      userTypeId: 2,
      firstName: 'Admin',
      lastName: 'User',
    });
  });

  describe('GET /api/job-roles', () => {
    it('should return a list of job roles', async () => {
      const mockJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Frontend Engineer',
          closingDate: new Date('2026-02-11'),
          capability: { capabilityId: 1, name: 'Engineering' },
          band: { bandId: 1, name: 'Band A' },
          status: { jobRoleStatusId: 1, statusName: 'Open' },
          locations: [
            {
              jobRoleLocationId: 1,
              location: { locationId: 1, name: 'HQ' },
            },
          ],
        },
      ];

      (prisma.jobRole.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockJobRoles,
      );

      const response = await request(app)
        .get('/api/job-roles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return job roles with correct structure', async () => {
      const mockJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Frontend Engineer',
          closingDate: new Date('2026-02-11'),
          capability: { capabilityId: 1, name: 'Engineering' },
          band: { bandId: 1, name: 'Band A' },
          status: { jobRoleStatusId: 1, statusName: 'Open' },
          locations: [
            {
              jobRoleLocationId: 1,
              location: { locationId: 1, name: 'HQ' },
            },
          ],
        },
      ];

      (prisma.jobRole.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockJobRoles,
      );

      const response = await request(app)
        .get('/api/job-roles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        const jobRole = response.body[0];
        expect(jobRole).toHaveProperty('jobRoleId');
        expect(jobRole).toHaveProperty('roleName');
        expect(jobRole).toHaveProperty('closingDate');
      }
    });

    it('should return empty array when no job roles exist', async () => {
      (prisma.jobRole.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        [],
      );

      const response = await request(app)
        .get('/api/job-roles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      (prisma.jobRole.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database connection failed'),
      );

      const response = await request(app)
        .get('/api/job-roles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
