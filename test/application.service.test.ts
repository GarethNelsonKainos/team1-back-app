import type { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationService } from '../src/services/application.service';
import type { S3Service } from '../src/services/s3.service';

describe('ApplicationService', () => {
  let applicationService: ApplicationService;
  let mockPrisma: {
    jobRole: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    application: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };
  let mockS3Service: {
    uploadFile: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockPrisma = {
      jobRole: {
        findUnique: vi.fn(),
      },
      application: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };

    mockS3Service = {
      uploadFile: vi.fn(),
    };

    applicationService = new ApplicationService(
      mockPrisma as unknown as PrismaClient,
      mockS3Service as unknown as S3Service,
    );
  });

  describe('createApplication', () => {
    it('should create application successfully when job is open and user hasnt applied', async () => {
      const request = { jobRoleId: 1, userId: 1 };
      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Open' },
      });

      mockPrisma.application.findFirst.mockResolvedValue(null);

      const expectedApplication = {
        applicationId: 1,
        jobRoleId: 1,
        userId: 1,
        applicationStatusId: 1,
        createdAt: new Date(),
      };
      mockPrisma.application.create.mockResolvedValue(expectedApplication);

      const result = await applicationService.createApplication(request);

      expect(result).toEqual(expectedApplication);
    });

    it('should return null when job role does not exist', async () => {
      const request = { jobRoleId: 999, userId: 1 };
      mockPrisma.jobRole.findUnique.mockResolvedValue(null);

      const result = await applicationService.createApplication(request);

      expect(result).toBeNull();
    });

    it('should return null when job role is closed', async () => {
      const request = { jobRoleId: 1, userId: 1 };
      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Closed' },
      });

      const result = await applicationService.createApplication(request);

      expect(result).toBeNull();
    });

    it('should return null when user has already applied', async () => {
      const request = { jobRoleId: 1, userId: 1 };
      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Open' },
      });

      mockPrisma.application.findFirst.mockResolvedValue({
        applicationId: 1,
        jobRoleId: 1,
        userId: 1,
      });

      const result = await applicationService.createApplication(request);

      expect(result).toBeNull();
    });

    it('should prevent duplicate applications for same user and job role', async () => {
      const request = { jobRoleId: 1, userId: 1 };

      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Open' },
      });

      // User already has an application for this job
      mockPrisma.application.findFirst.mockResolvedValue({
        applicationId: 123,
        userId: 1,
        jobRoleId: 1,
        applicationStatusId: 1,
        createdAt: new Date(),
      });

      const result = await applicationService.createApplication(request);

      expect(result).toBeNull();
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });
  });
});
