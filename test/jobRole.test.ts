import type { Request, Response } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/index';

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

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.resetModules();
      vi.unmock('../src/db/prisma.js');
    });

    it('should handle database errors and return 500', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Re-import with mocked prisma
      vi.doMock('../src/db/prisma.js', () => ({
        prisma: {
          jobRole: {
            findMany: vi.fn().mockRejectedValue(new Error('DB error')),
          },
        },
      }));

      vi.resetModules();

      const { getJobRoles } = await import(
        '../src/controllers/JobRoleController.js'
      );
      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getJobRoles({} as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to fetch job roles',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
