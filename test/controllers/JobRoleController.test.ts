import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobRoleController } from '../../src/controllers/JobRoleController';
import type { JobRoleService } from '../../src/services/JobRoleService';

// Mock feature flags
vi.mock('../../src/config/featureFlags', () => ({
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
});
