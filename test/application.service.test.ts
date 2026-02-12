import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '../src/generated/prisma/client';
import { ApplicationService } from '../src/services/application.service';

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
    applicationStatus: {
      findUnique: ReturnType<typeof vi.fn>;
    };
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
      applicationStatus: {
        findUnique: vi.fn(),
      },
    };

    applicationService = new ApplicationService(mockPrisma as unknown as PrismaClient);
  });

  describe('createApplication', () => {
    it('should create application successfully when job is open and user hasnt applied', async () => {
      const request = { jobRoleId: 1, userId: 1 };
      
      // Mock job role exists and is open
      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Open' },
      });

      // Mock no existing application
      mockPrisma.application.findFirst.mockResolvedValue(null);

      // Mock applied status exists
      mockPrisma.applicationStatus.findUnique.mockResolvedValue({
        applicationStatusId: 1,
        applicationStatusType: 'Applied',
      });

      // Mock application creation
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
      expect(mockPrisma.jobRole.findUnique).toHaveBeenCalledWith({
        where: { jobRoleId: 1 },
        include: { status: true },
      });
      expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
        where: { userId: 1, jobRoleId: 1 },
      });
      expect(mockPrisma.application.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          jobRoleId: 1,
          applicationStatusId: 1,
        },
      });
    });

    it('should return null when job role does not exist', async () => {
      const request = { jobRoleId: 999, userId: 1 };
      
      mockPrisma.jobRole.findUnique.mockResolvedValue(null);

      const result = await applicationService.createApplication(request);

      expect(result).toBeNull();
      expect(mockPrisma.application.findFirst).not.toHaveBeenCalled();
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
      expect(mockPrisma.application.findFirst).not.toHaveBeenCalled();
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
      expect(mockPrisma.applicationStatus.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when Applied status not found in database', async () => {
      const request = { jobRoleId: 1, userId: 1 };
      
      mockPrisma.jobRole.findUnique.mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        status: { statusName: 'Open' },
      });

      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.applicationStatus.findUnique.mockResolvedValue(null);

      await expect(applicationService.createApplication(request)).rejects.toThrow(
        'Applied status not found in database'
      );
    });
  });
});