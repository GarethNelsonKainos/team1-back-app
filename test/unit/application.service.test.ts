import { Readable } from 'node:stream';
import type { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationService } from '../../src/services/application.service';
import type { S3Service } from '../../src/services/s3.service';
import type { CreateApplicationRequest } from '../../src/types/application.types';

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

  const createMockFile = (): Express.Multer.File => ({
    fieldname: 'cv',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test'),
    size: 1024,
    stream: new Readable(),
    destination: '',
    filename: '',
    path: '',
  });

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
      const mockFile = createMockFile();
      const request = { jobRoleId: 1, userId: 1, cvFile: mockFile };

      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Open' },
      });

      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockS3Service.uploadFile.mockResolvedValue('s3://bucket/cv.pdf');
      mockPrisma.application.create.mockResolvedValue({
        applicationId: 1,
        jobRoleId: 1,
        userId: 1,
        applicationStatusId: 1,
        createdAt: new Date(),
        cvUrl: 's3://bucket/cv.pdf',
      });

      const result = await applicationService.createApplication(request);

      expect(result).toEqual({
        applicationId: 1,
        jobRoleId: 1,
        userId: 1,
        applicationStatusId: 1,
        createdAt: expect.any(Date),
        cvUrl: 's3://bucket/cv.pdf',
      });
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(mockFile, 1);
    });

    it('should return null when job role does not exist', async () => {
      const mockFile = createMockFile();
      const request = { jobRoleId: 999, userId: 1, cvFile: mockFile };
      mockPrisma.jobRole.findUnique.mockResolvedValue(null);

      const result = await applicationService.createApplication(request);

      expect(result).toBeNull();
      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
    });

    it('should return null when job role is closed', async () => {
      const mockFile = createMockFile();
      const request = { jobRoleId: 1, userId: 1, cvFile: mockFile };
      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Closed' },
      });

      const result = await applicationService.createApplication(request);

      expect(result).toBeNull();
      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
    });

    it('should return null when user has already applied', async () => {
      const mockFile = createMockFile();
      const request = { jobRoleId: 1, userId: 1, cvFile: mockFile };

      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Open' },
      });

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
      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
    });

    it('should create application without CV file', async () => {
      const request = {
        jobRoleId: 1,
        userId: 1,
        cvFile: undefined,
      } as unknown as CreateApplicationRequest;

      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Open' },
      });

      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({
        applicationId: 1,
        jobRoleId: 1,
        userId: 1,
        applicationStatusId: 1,
        createdAt: new Date(),
        cvUrl: undefined,
      });

      const result = await applicationService.createApplication(request);

      expect(result).toBeDefined();
      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
      expect(mockPrisma.application.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          jobRoleId: 1,
          applicationStatusId: 1,
          cvUrl: undefined,
        },
      });
    });

    it('should handle S3 upload failure gracefully', async () => {
      const mockFile = createMockFile();
      const request = { jobRoleId: 1, userId: 1, cvFile: mockFile };

      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Open' },
      });

      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockS3Service.uploadFile.mockRejectedValue(new Error('S3 upload failed'));

      await expect(
        applicationService.createApplication(request),
      ).rejects.toThrow('S3 upload failed');
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });

    it('should set applicationStatusId to 1 for submitted status', async () => {
      const mockFile = createMockFile();
      const request = { jobRoleId: 1, userId: 1, cvFile: mockFile };

      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Open' },
      });

      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockS3Service.uploadFile.mockResolvedValue('s3://bucket/cv.pdf');
      mockPrisma.application.create.mockResolvedValue({
        applicationId: 1,
        jobRoleId: 1,
        userId: 1,
        applicationStatusId: 1,
        createdAt: new Date(),
        cvUrl: 's3://bucket/cv.pdf',
      });

      await applicationService.createApplication(request);

      expect(mockPrisma.application.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          jobRoleId: 1,
          applicationStatusId: 1,
          cvUrl: 's3://bucket/cv.pdf',
        },
      });
    });
  });

  describe('hasUserApplied', () => {
    it('should return true when user has applied', async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        applicationId: 1,
        userId: 1,
        jobRoleId: 1,
        applicationStatusId: 1,
        createdAt: new Date(),
      });

      const result = await applicationService.hasUserApplied(1, 1);

      expect(result).toBe(true);
    });

    it('should return false when user has not applied', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);

      const result = await applicationService.hasUserApplied(1, 1);

      expect(result).toBe(false);
    });

    it('should query with correct userId and jobRoleId', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);

      await applicationService.hasUserApplied(42, 99);

      expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
        where: { userId: 42, jobRoleId: 99 },
      });
    });
  });
});
