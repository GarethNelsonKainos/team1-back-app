import type { PrismaClient } from '@prisma/client';

export interface CreateApplicationRequest {
  jobRoleId: number;
  userId: number;
}

export interface ApplicationResult {
  applicationId: number;
  jobRoleId: number;
  userId: number;
  applicationStatusId: number;
  createdAt: Date;
}

export class ApplicationService {
  constructor(private prisma: PrismaClient) {}

  async createApplication(
    request: CreateApplicationRequest,
  ): Promise<ApplicationResult | null> {
    const { jobRoleId, userId } = request;

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

    // Get initial "Submitted" application status ID (based on seed data)
    const appliedStatus = await this.prisma.applicationStatus.findUnique({
      where: { applicationStatusType: 'Submitted' },
    });

    if (!appliedStatus) {
      throw new Error('Submitted status not found in database');
    }

    // Create application
    const application = await this.prisma.application.create({
      data: {
        userId,
        jobRoleId,
        applicationStatusId: appliedStatus.applicationStatusId,
      },
    });

    return application;
  }
}
