import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationController } from '../../src/controllers/ApplicationController';
import type { ApplicationService } from '../../src/services/application.service';
import { UserRole } from '../../src/types/auth.types';
import * as FeatureFlags from '../../src/utils/FeatureFlags';

vi.mock('../../src/utils/FeatureFlags');

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let mockApplicationService: {
    createApplication: ReturnType<typeof vi.fn>;
    hasUserApplied: ReturnType<typeof vi.fn>;
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
      params: {},
    };

    mockApplicationService = {
      createApplication: vi.fn(),
      hasUserApplied: vi.fn(),
    };

    controller = new ApplicationController(
      mockApplicationService as unknown as ApplicationService,
    );

    vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);
  });

  describe('createApplication', () => {
    it('should create application successfully for valid applicant', async () => {
      mockReq.body = { jobRoleId: 1 };
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        userRole: UserRole.Applicant,
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

      await controller.createApplication(
        mockReq as Request,
        mockRes as Response,
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

      await controller.createApplication(
        mockReq as Request,
        mockRes as Response,
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
        userRole: UserRole.Admin,
        firstName: 'Admin',
        lastName: 'User',
      };

      await controller.createApplication(
        mockReq as Request,
        mockRes as Response,
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
        userRole: UserRole.Applicant,
        firstName: 'Test',
        lastName: 'User',
      };

      await controller.createApplication(
        mockReq as Request,
        mockRes as Response,
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
        userRole: UserRole.Applicant,
        firstName: 'Test',
        lastName: 'User',
      };

      mockApplicationService.createApplication.mockRejectedValue(
        new Error('Database error'),
      );

      await controller.createApplication(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });
  });

  describe('checkApplicationStatus', () => {
    it('should return true when user has applied', async () => {
      mockReq.params = { jobRoleId: '1' };
      mockReq.user = { userId: 1, userRole: UserRole.Applicant };

      mockApplicationService.hasUserApplied.mockResolvedValue(true);

      await controller.checkApplicationStatus(
        mockReq as Request,
        mockRes as Response,
      );

      expect(jsonMock).toHaveBeenCalledWith({ hasApplied: true });
    });

    it('should return false when user has not applied', async () => {
      mockReq.params = { jobRoleId: '1' };
      mockReq.user = { userId: 1, userRole: UserRole.Applicant };

      mockApplicationService.hasUserApplied.mockResolvedValue(false);

      await controller.checkApplicationStatus(
        mockReq as Request,
        mockRes as Response,
      );

      expect(jsonMock).toHaveBeenCalledWith({ hasApplied: false });
    });

    it('should return 401 when user not authenticated', async () => {
      mockReq.params = { jobRoleId: '1' };
      mockReq.user = undefined;

      await controller.checkApplicationStatus(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });
  });
});
