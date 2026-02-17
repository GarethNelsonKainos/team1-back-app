import type { PrismaClient } from '@prisma/client';
import type { S3Service } from './s3.service';

export interface CreateApplicationRequest {
  jobRoleId: number;
  userId: number;
  cvFile?: Express.Multer.File;
}

export interface Application {
  applicationId: number;
  jobRoleId: number;
  userId: number;
  applicationStatusId: number;
  cvUrl?: string | null;
  createdAt: Date;
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
  ): Promise<Application | null> {
    const { jobRoleId, userId, cvFile } = request;

    // Check if job role exists and is open
    const jobRole = await this.prisma.jobRole.findUnique({
      where: { jobRoleId },
      include: { status: true },
    });

    if (!jobRole || jobRole.status.statusName !== 'Open') {
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
        applicationStatusId: 1, // Hardcoded "Submitted" status from seed data
        cvUrl: cvUrl,
      },
    });

    return application;
  }

  async hasUserApplied(userId: number, jobRoleId: number): Promise<boolean> {
    const application = await this.prisma.application.findFirst({
      where: { userId, jobRoleId },
    });
    return !!application;
  }
}
