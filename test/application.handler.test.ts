import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApplicationHandler } from '../src/handlers/application.handler';
import { ApplicationService } from '../src/services/application.service';
import * as FeatureFlags from '../src/utils/FeatureFlags';

// Mock the ApplicationService and FeatureFlags
vi.mock('../src/services/application.service');
vi.mock('../src/utils/FeatureFlags');

describe('application.handler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockPrisma: PrismaClient;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let mockApplicationService: {
    createApplication: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis();
    jsonMock = vi.fn();

    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    mockReq = {
      body: {},
      user: undefined,
      headers: {},
    };

    mockPrisma = {
      userType: {
        findFirst: vi.fn().mockResolvedValue({
          userTypeId: 1,
          userTypeDesc: 'Applicant',
        }),
      },
    } as unknown as PrismaClient;

    // Setup ApplicationService mock
    mockApplicationService = {
      createApplication: vi.fn(),
    };

    // Mock the constructor to return our mock instance
    vi.mocked(ApplicationService).mockImplementation(
      () => mockApplicationService as unknown as ApplicationService,
    );

    // Mock FeatureFlags to be enabled by default
    vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);
  });

  describe('createApplicationHandler', () => {
    it('should create application successfully for valid applicant', async () => {
      mockReq.body = { jobRoleId: 1 };
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'User',
      };

      const expectedApplication = {
        applicationId: 1,
        jobRoleId: 1,
        userId: 1,
        applicationStatusId: 1,
        createdAt: new Date(),
      };

      mockApplicationService.createApplication.mockResolvedValue(
        expectedApplication,
      );

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Application submitted successfully',
        application: expectedApplication,
      });
    });

    it('should return 400 for invalid jobRoleId', async () => {
      mockReq.body = { jobRoleId: 'invalid' };
      mockReq.user = { userId: 1, userTypeId: 1 };

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid job role ID',
      });
    });

    it('should return 400 for missing jobRoleId', async () => {
      mockReq.body = {};
      mockReq.user = { userId: 1, userTypeId: 1 };

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid job role ID',
      });
    });

    it('should return 401 when user not authenticated', async () => {
      mockReq.body = { jobRoleId: 1 };
      mockReq.user = undefined;

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });

    it('should return 403 when user is not an applicant', async () => {
      mockReq.body = { jobRoleId: 1 };
      mockReq.user = {
        userId: 1,
        email: 'admin@example.com',
        userTypeId: 2, // Admin, not applicant
        firstName: 'Admin',
        lastName: 'User',
      };

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Only applicants can apply for roles',
      });
    });

    it('should return 400 when service returns null (business logic failure)', async () => {
      mockReq.body = { jobRoleId: 1 };
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'User',
      };

      mockApplicationService.createApplication.mockResolvedValue(null);

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error:
          'Unable to apply. Role may not be open or you may have already applied.',
      });
    });

    it('should return 500 when service throws error', async () => {
      mockReq.body = { jobRoleId: 1 };
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'User',
      };

      mockApplicationService.createApplication.mockRejectedValue(
        new Error('Database error'),
      );

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });

    it('should redirect to success page for form submissions', async () => {
      mockReq.body = { jobRoleId: '1' }; // Form data comes as string
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'User',
      };
      mockReq.headers = {
        'content-type': 'application/x-www-form-urlencoded',
      };

      const expectedApplication = {
        applicationId: 1,
        jobRoleId: 1,
        userId: 1,
        applicationStatusId: 1,
        createdAt: new Date(),
      };

      mockApplicationService.createApplication.mockResolvedValue(
        expectedApplication,
      );

      const redirectMock = vi.fn();
      mockRes.redirect = redirectMock;

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(redirectMock).toHaveBeenCalledWith(
        'http://localhost:3000/application-success',
      );
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('should convert string jobRoleId to number for form submissions', async () => {
      mockReq.body = { jobRoleId: '123' }; // Form data as string
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'User',
      };

      const expectedApplication = {
        applicationId: 1,
        jobRoleId: 123,
        userId: 1,
        applicationStatusId: 1,
        createdAt: new Date(),
      };

      mockApplicationService.createApplication.mockResolvedValue(
        expectedApplication,
      );

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(mockApplicationService.createApplication).toHaveBeenCalledWith({
        jobRoleId: 123, // Should be converted to number
        userId: 1,
      });
    });

    it('should return 503 when job applications feature is disabled', async () => {
      // Mock feature flag as disabled
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(false);

      mockReq.body = { jobRoleId: 1 };
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'User',
      };

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Job applications are currently not available',
      });
      expect(mockApplicationService.createApplication).not.toHaveBeenCalled();
    });

    it('should return 500 when applicant user type is not found in database', async () => {
      // Mock userType.findFirst to return null (not found)
      vi.mocked(mockPrisma.userType.findFirst).mockResolvedValue(null);

      mockReq.body = { jobRoleId: 1 };
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'User',
      };

      await createApplicationHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
      expect(mockApplicationService.createApplication).not.toHaveBeenCalled();
    });
  });
});
