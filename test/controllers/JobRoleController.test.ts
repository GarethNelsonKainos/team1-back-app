import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { JobRoleController } from '../../src/controllers/JobRoleController.js';
import type { JobRoleService } from '../../src/services/JobRoleService.js';

describe('JobRoleController', () => {
  describe('getJobRoles', () => {
    it('should return job roles from service with 200 status', async () => {
      const mockJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Engineer',
          location: 'London',
          capability: 'Engineering',
          band: 'Mid',
          closingDate: '2026-03-15T00:00:00.000Z',
        },
      ];

      const mockService = {
        getJobRoles: vi.fn().mockResolvedValue(mockJobRoles),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const mockRes: Partial<Response> = {
        json: vi.fn().mockReturnThis(),
      };

      await controller.getJobRoles(
        {} as Request,
        mockRes as unknown as Response,
      );

      expect(mockService.getJobRoles).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockJobRoles);
    });

    it('should handle service errors with 500 status', async () => {
      const mockError = new Error('Service error');
      const mockService = {
        getJobRoles: vi.fn().mockRejectedValue(mockError),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.getJobRoles(
        {} as Request,
        mockRes as unknown as Response,
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to fetch job roles',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching job roles:',
        mockError,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty results', async () => {
      const mockService = {
        getJobRoles: vi.fn().mockResolvedValue([]),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const mockRes: Partial<Response> = {
        json: vi.fn().mockReturnThis(),
      };

      await controller.getJobRoles(
        {} as Request,
        mockRes as unknown as Response,
      );

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });
  });
});
