import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobRoleController } from '../../src/controllers/JobRoleController';
import type { JobRoleService } from '../../src/services/JobRoleService';

// Mock feature flags
vi.mock('../../src/utils/FeatureFlags', () => ({
  FEATURE_FLAGS: {
    ADMIN_CREATE_JOB_ROLE: true,
  },
}));

// Mock validation
vi.mock('../../src/utils/validation.utils', () => ({
  validateCreateJobRole: vi.fn((data) => data),
}));

describe('JobRoleController - New Methods', () => {
  let jobRoleController: JobRoleController;
  let mockJobRoleService: {
    getJobRoles: ReturnType<typeof vi.fn>;
    getJobRoleDetailed: ReturnType<typeof vi.fn>;
    createJobRole: ReturnType<typeof vi.fn>;
    getBands: ReturnType<typeof vi.fn>;
    getCapabilities: ReturnType<typeof vi.fn>;
    getLocations: ReturnType<typeof vi.fn>;
    getJobRoleById: ReturnType<typeof vi.fn>;
  };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockJobRoleService = {
      getJobRoles: vi.fn(),
      getJobRoleDetailed: vi.fn(),
      createJobRole: vi.fn(),
      getBands: vi.fn(),
      getCapabilities: vi.fn(),
      getLocations: vi.fn(),
      getJobRoleById: vi.fn(),
    };

    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };

    jobRoleController = new JobRoleController(
      mockJobRoleService as unknown as JobRoleService,
    );
  });

  describe('createJobRole', () => {
    it('should create a job role successfully', async () => {
      const mockResult = {
        jobRoleId: 1,
        message: 'Job role created successfully',
      };
      mockJobRoleService.createJobRole.mockResolvedValue(mockResult);

      mockRequest.body = {
        roleName: 'Senior Software Engineer',
        capabilityId: 1,
        bandId: 2,
        description: 'Test description',
        responsibilities: 'Test responsibilities',
        jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
        openPositions: 2,
        locationIds: [1, 2],
        closingDate: '2026-12-31T00:00:00.000Z',
      };

      await jobRoleController.createJobRole(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 on validation error', async () => {
      const error = new Error('Validation failed');
      mockJobRoleService.createJobRole.mockRejectedValue(error);

      mockRequest.body = {
        roleName: 'Test',
      };

      await jobRoleController.createJobRole(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
      });
    });

    it('should return 500 on unexpected error', async () => {
      mockJobRoleService.createJobRole.mockRejectedValue('Unknown error');

      mockRequest.body = {
        roleName: 'Test Role',
      };

      await jobRoleController.createJobRole(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to create job role',
      });
    });
  });

  describe('getBands', () => {
    it('should return all bands', async () => {
      const mockBands = [
        { bandId: 1, bandName: 'Associate' },
        { bandId: 2, bandName: 'Senior Associate' },
      ];
      mockJobRoleService.getBands.mockResolvedValue(mockBands);

      await jobRoleController.getBands(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockBands);
    });

    it('should return 500 on error', async () => {
      mockJobRoleService.getBands.mockRejectedValue(new Error('DB error'));

      await jobRoleController.getBands(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch bands',
      });
    });
  });

  describe('getCapabilities', () => {
    it('should return all capabilities', async () => {
      const mockCapabilities = [
        { capabilityId: 1, capabilityName: 'Engineering' },
      ];
      mockJobRoleService.getCapabilities.mockResolvedValue(mockCapabilities);

      await jobRoleController.getCapabilities(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockCapabilities);
    });

    it('should return 500 on error', async () => {
      mockJobRoleService.getCapabilities.mockRejectedValue(
        new Error('DB error'),
      );

      await jobRoleController.getCapabilities(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch capabilities',
      });
    });
  });

  describe('getLocations', () => {
    it('should return all locations', async () => {
      const mockLocations = [
        {
          locationId: 1,
          locationName: 'Belfast',
          city: 'Belfast',
          country: 'UK',
        },
      ];
      mockJobRoleService.getLocations.mockResolvedValue(mockLocations);

      await jobRoleController.getLocations(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockLocations);
    });

    it('should return 500 on error', async () => {
      mockJobRoleService.getLocations.mockRejectedValue(new Error('DB error'));

      await jobRoleController.getLocations(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch locations',
      });
    });
  });

  describe('getJobRoles', () => {
    it('should return all job roles', async () => {
      const mockJobRoles = [
        {
          jobRoleId: 1,
          jobRoleName: 'Software Engineer',
        },
      ];

      mockJobRoleService.getJobRoles.mockResolvedValue(mockJobRoles);

      await jobRoleController.getJobRoles(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockJobRoles);
    });

    it('should return 500 when the service throws an error', async () => {
      mockJobRoleService.getJobRoles.mockRejectedValue(new Error('DB error'));

      await jobRoleController.getJobRoles(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch job roles',
      });
    });
  });

  describe('getJobRoleById', () => {
    it('should return a job role when a valid ID is provided', async () => {
      const mockJobRole = {
        jobRoleId: 1,
        jobRoleName: 'Software Engineer',
      };

      mockJobRoleService.getJobRoleDetailed.mockResolvedValue(mockJobRole);

      const request = {
        ...mockRequest,
        params: { id: '1' },
      } as Request;

      await jobRoleController.getJobRoleById(request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockJobRole);
    });

    it('should return 404 when the job role is not found', async () => {
      mockJobRoleService.getJobRoleDetailed.mockResolvedValue(null);

      const request = {
        ...mockRequest,
        params: { id: '999' },
      } as Request;

      await jobRoleController.getJobRoleById(request, mockResponse as Response);
      await jobRoleController.getJobRoleById(request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Job role not found',
      });
    });

    it('should return 400 when the ID parameter is invalid', async () => {
      const request = {
        ...mockRequest,
        params: { id: 'invalid-id' },
      } as Request;

      await jobRoleController.getJobRoleById(request, mockResponse as Response);
      await jobRoleController.getJobRoleById(request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid job role ID',
      });
    });

    it('should return 500 when the service throws an error', async () => {
      mockJobRoleService.getJobRoleDetailed.mockRejectedValue(
        new Error('DB error'),
      );
      mockJobRoleService.getJobRoleById.mockRejectedValue(
        new Error('DB error'),
      );

      const request = {
        ...mockRequest,
        params: { id: '1' },
      } as Request;

      await jobRoleController.getJobRoleById(request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch job role',
      });
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
