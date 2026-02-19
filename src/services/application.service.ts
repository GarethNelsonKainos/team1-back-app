import type { PrismaClient } from '@prisma/client';
import type {
  Application,
  CreateApplicationRequest,
} from '../types/application.types.js';
import { JobRoleStatus } from '../types/application.types.js';
import type { S3Service } from './s3.service';

export class ApplicationService {
  private prisma: PrismaClient;
  private s3Service: S3Service;

  constructor(prisma: PrismaClient, s3Service: S3Service) {
    this.prisma = prisma;
    this.s3Service = s3Service;
  }

  async createApplication(
    request: CreateApplicationRequest,
  ): Promise<Application | null> {
    const { jobRoleId, userId, cvFile } = request;

    // Check if job role exists and is open
    const jobRole = await this.prisma.jobRole.findUnique({
      where: { jobRoleId },
      include: { status: true },
    });

    if (!jobRole || jobRole.status.statusName !== JobRoleStatus.Open) {
      return null;
    }

    // Check if user already applied for this role
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        userId,
        jobRoleId,
      },
    });

    if (existingApplication) {
      return null;
    }

    // Upload to S3 if file is present
    let cvUrl: string | undefined;
    if (cvFile) {
      cvUrl = await this.s3Service.uploadFile(cvFile, userId);
    }

    // Create application with "Submitted" status (ID: 1 from seed data)
    const application = await this.prisma.application.create({
      data: {
        userId,
        jobRoleId,
        applicationStatusId: 1, // "Submitted" status from seed data
        cvUrl: cvUrl,
      },
    });
    console.log(
      'Created application:',
      application.applicationId,
      'for user',
      userId,
      'job role',
      jobRoleId,
    );
    return application;
  }

  async hasUserApplied(userId: number, jobRoleId: number): Promise<boolean> {
    console.log(
      'Checking if user',
      userId,
      'has applied for job role',
      jobRoleId,
    );
    const application = await this.prisma.application.findFirst({
      where: { userId, jobRoleId },
    });
    console.log(
      'Found application:',
      application ? `ID: ${application.applicationId}` : 'none',
    );
    return !!application;
  }
}
