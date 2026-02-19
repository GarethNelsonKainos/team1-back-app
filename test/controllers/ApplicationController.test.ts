import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationController } from '../../src/controllers/ApplicationController';
import type { ApplicationService } from '../../src/services/application.service';
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
      file: undefined,
      user: {
        userId: 1,
        email: 'test@test.com',
        userRole: 1,
        firstName: 'Test',
        lastName: 'User',
      },
      headers: { authorization: 'Bearer test-token' },
    };

    mockApplicationService = {
      createApplication: vi.fn(),
    };

    controller = new ApplicationController(
      mockApplicationService as unknown as ApplicationService,
    );

    vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);
  });

  describe('createApplication', () => {
    it('should create application successfully with valid data', async () => {
      mockReq.body = { jobRoleId: 1 };
      mockReq.file = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as Express.Multer.File;

      mockApplicationService.createApplication.mockResolvedValue(true);

      await controller.createApplication(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Application submitted successfully',
        application: true,
      });
    });

    it('should return 400 when service returns false', async () => {
      mockReq.body = { jobRoleId: 1 };
      mockReq.file = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as Express.Multer.File;

      mockApplicationService.createApplication.mockResolvedValue(false);

      await controller.createApplication(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error:
          'Unable to apply. Role may not be open or you may have already applied.',
      });
    });

    it('should return 400 when job role ID is invalid', async () => {
      mockReq.body = { jobRoleId: 'invalid' };
      mockReq.file = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as Express.Multer.File;

      await controller.createApplication(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid job role ID',
      });
    });

    it('should return 400 when CV file is missing', async () => {
      mockReq.body = { jobRoleId: 1 };
      mockReq.file = undefined;

      await controller.createApplication(
        mockReq as Request,
        mockRes as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'CV file is required',
      });
    });

    it('should return 503 when job applications feature is disabled', async () => {
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(false);

      mockReq.body = { jobRoleId: 1 };
      mockReq.file = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as Express.Multer.File;

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
      mockReq.file = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as Express.Multer.File;

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
});
