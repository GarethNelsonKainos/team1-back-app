import type { PrismaClient } from '@prisma/client';
import type {
  Application,
  CreateApplicationRequest,
} from '../types/application.types';
import { JobRoleStatus } from '../types/application.types';
import type { S3Service } from './s3.service';

enum ApplicationStatus {
  InProgress = 1,
}

export class ApplicationService {
  private prisma: PrismaClient;
  private s3Service: S3Service;

  constructor(prisma: PrismaClient, s3Service: S3Service) {
    this.prisma = prisma;
    this.s3Service = s3Service;
  }

  async createApplication(
    request: CreateApplicationRequest,
  ): Promise<boolean> {
    const { jobRoleId, userId, cvFile } = request;

    const jobRole = await this.prisma.jobRole.findUnique({
      where: { jobRoleId },
      include: { status: true },
    });

    if (!jobRole || jobRole.status.statusName !== JobRoleStatus.Open) {
      console.log('Job role is not open for applications. Job role ID:', jobRoleId);
      return false;
    }

    const existingApplication = await this.prisma.application.findFirst({
      where: {
        userId,
        jobRoleId,
      },
    });

    if (existingApplication) {
      console.log('User has already applied for this job role. User ID:', userId, 'Job role ID:', jobRoleId);
      return false;
    }

    const cvUrl = await this.s3Service.uploadFile(cvFile, userId);

    await this.prisma.application.create({
      data: {
        userId,
        jobRoleId,
        applicationStatusId: ApplicationStatus.InProgress,
        cvUrl: cvUrl,
      },
    });

    return true;
  }
}
