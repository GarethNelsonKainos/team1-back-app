import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkApplicationStatusHandler,
  createApplicationHandler,
} from '../src/handlers/application.handler';
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
      application: {
        findFirst: vi.fn(),
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

    it('should return 503 when job applications feature is disabled', async () => {
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
  });

  describe('checkApplicationStatusHandler', () => {
    it('should return true when user has applied', async () => {
      mockReq.params = { jobRoleId: '1' };
      mockReq.user = { userId: 1, userTypeId: 1 };

      vi.mocked(mockPrisma.application.findFirst).mockResolvedValue({
        applicationId: 1,
        jobRoleId: 1,
        userId: 1,
        applicationStatusId: 1,
        createdAt: new Date(),
      });

      await checkApplicationStatusHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(jsonMock).toHaveBeenCalledWith({ hasApplied: true });
    });

    it('should return false when user has not applied', async () => {
      mockReq.params = { jobRoleId: '1' };
      mockReq.user = { userId: 1, userTypeId: 1 };

      vi.mocked(mockPrisma.application.findFirst).mockResolvedValue(null);

      await checkApplicationStatusHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(jsonMock).toHaveBeenCalledWith({ hasApplied: false });
    });

    it('should return 401 when user not authenticated', async () => {
      mockReq.params = { jobRoleId: '1' };
      mockReq.user = undefined;

      await checkApplicationStatusHandler(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });
  });
});
