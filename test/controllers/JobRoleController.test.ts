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

  describe('getJobRoleById', () => {
    it('should return job role by id with 200 status', async () => {
      const mockJobRole = {
        jobRoleId: 1,
        roleName: 'Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Mid',
        closingDate: '2026-03-15T00:00:00.000Z',
        description: 'desc',
        responsibilities: ['a', 'b'],
        jobSpecLink: 'link',
        status: 'Open',
        openPositions: 2,
      };

      const mockService = {
        getJobRoleDetailed: vi.fn().mockResolvedValue(mockJobRole),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const mockReq = { params: { id: '1' } } as unknown as Request;
      const mockRes: Partial<Response> = {
        json: vi.fn().mockReturnThis(),
      };

      await controller.getJobRoleById(mockReq, mockRes as Response);

      expect(mockService.getJobRoleDetailed).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockJobRole);
    });

    it('should return 400 if id is invalid', async () => {
      const mockService = {
        getJobRoleDetailed: vi.fn(),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const mockReq = { params: { id: 'abc' } } as unknown as Request;
      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.getJobRoleById(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid job role ID',
      });
      expect(mockService.getJobRoleDetailed).not.toHaveBeenCalled();
    });

    it('should return 404 if job role not found', async () => {
      const mockService = {
        getJobRoleDetailed: vi.fn().mockResolvedValue(null),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const mockReq = { params: { id: '2' } } as unknown as Request;
      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.getJobRoleById(mockReq, mockRes as Response);

      expect(mockService.getJobRoleDetailed).toHaveBeenCalledWith(2);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Job role not found',
      });
    });
  });

  describe('deleteJobRole', () => {
    it('should return 400 for invalid ID (NaN)', async () => {
      const mockService = {
        deleteJobRole: vi.fn(),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const mockReq: Partial<Request> = {
        params: { id: 'abc' },
      };

      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.deleteJobRole(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid job role ID',
      });
      expect(mockService.deleteJobRole).not.toHaveBeenCalled();
    });

    it('should return 204 on successful deletion', async () => {
      const mockService = {
        deleteJobRole: vi.fn().mockResolvedValue(undefined),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const mockReq: Partial<Request> = {
        params: { id: '5' },
      };

      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await controller.deleteJobRole(mockReq as Request, mockRes as Response);

      expect(mockService.deleteJobRole).toHaveBeenCalledWith(5);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 when job role not found (Prisma P2025)', async () => {
      const prismaError = { code: 'P2025', message: 'Record not found' };
      const mockService = {
        deleteJobRole: vi.fn().mockRejectedValue(prismaError),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const mockReq: Partial<Request> = {
        params: { id: '5' },
      };

      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.deleteJobRole(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Job role not found',
      });
    });

    it('should return 404 for error message containing "not found"', async () => {
      const error = { message: 'Job role not found in database' };
      const mockService = {
        deleteJobRole: vi.fn().mockRejectedValue(error),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const mockReq: Partial<Request> = {
        params: { id: '5' },
      };

      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.deleteJobRole(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Job role not found',
      });
    });

    it('should return 400 for invalid ID from service', async () => {
      const error = { message: 'Invalid job role ID' };
      const mockService = {
        deleteJobRole: vi.fn().mockRejectedValue(error),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const mockReq: Partial<Request> = {
        params: { id: '5' },
      };

      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.deleteJobRole(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid job role ID',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      const error = new Error('Database connection failed');
      const mockService = {
        deleteJobRole: vi.fn().mockRejectedValue(error),
      } as unknown as JobRoleService;

      const controller = new JobRoleController(mockService);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockReq: Partial<Request> = {
        params: { id: '5' },
      };

      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.deleteJobRole(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to delete job role',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting job role:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
