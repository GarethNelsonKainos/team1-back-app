import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';
import { S3Service } from '../services/s3.service';
import { isJobApplicationsEnabled } from '../utils/FeatureFlags';

// Lazy initialization of services to avoid creating them during module load
let s3ServiceInstance: S3Service | null = null;
let applicationServiceInstance: ApplicationService | null = null;

function getS3Service(): S3Service {
  if (!s3ServiceInstance) {
    s3ServiceInstance = new S3Service();
  }
  return s3ServiceInstance;
}

function getApplicationService(prisma: PrismaClient): ApplicationService {
  if (!applicationServiceInstance) {
    applicationServiceInstance = new ApplicationService(prisma);
  }
  return applicationServiceInstance;
}

// For testing purposes - reset singleton instances
export function resetServiceInstances(): void {
  s3ServiceInstance = null;
  applicationServiceInstance = null;
}

export async function createApplicationHandler(
  req: Request,
  res: Response,
  prisma: PrismaClient,
): Promise<void> {
  try {
    // Check if job applications feature is enabled
    if (!isJobApplicationsEnabled()) {
      res
        .status(503)
        .json({ error: 'Job applications are currently not available' });
      return;
    }

    const { jobRoleId } = req.body;
    const user = req.user; // From auth middleware

    // Convert jobRoleId to number (handles both JSON and form data)
    const roleId = Number.parseInt(String(jobRoleId), 10);

    // Input validation
    if (!jobRoleId || Number.isNaN(roleId)) {
      res.status(400).json({ error: 'Invalid job role ID' });
      return;
    }

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if user is an applicant (hardcode for MVP - Applicant user type is 1)
    if (user.userTypeId !== 1) {
      res.status(403).json({ error: 'Only applicants can apply for roles' });
      return;
    }

    // Handle CV upload if file is present
    let cvUrl: string | undefined;
    if (req.file) {
      try {
        const s3Service = getS3Service();
        cvUrl = await s3Service.uploadFile(req.file, user.userId);
      } catch (uploadError) {
        console.error('Error uploading CV:', uploadError);
        res.status(500).json({ error: 'Failed to upload CV' });
        return;
      }
    }

    const applicationService = getApplicationService(prisma);
    const result = await applicationService.createApplication({
      jobRoleId: roleId,
      userId: user.userId,
      cvUrl: cvUrl,
    });

    if (!result) {
      res.status(400).json({
        error:
          'Unable to apply. Role may not be open or you may have already applied.',
      });
      return;
    }

    // Redirect to success page based on successful database submission
    // For form submissions (from frontend), redirect to success page
    // For API calls, return JSON response
    const isFormSubmission = req.headers['content-type']?.includes(
      'multipart/form-data',
    );

    if (isFormSubmission) {
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/application-success`,
      );
    } else {
      res.status(201).json({
        message: 'Application submitted successfully',
        application: result,
      });
    }
  } catch (error) {
    console.error('Error in createApplicationHandler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function checkApplicationStatusHandler(
  req: Request,
  res: Response,
  prisma: PrismaClient,
): Promise<void> {
  try {
    const { jobRoleId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const application = await prisma.application.findFirst({
      where: {
        userId: user.userId,
        jobRoleId: Number.parseInt(String(jobRoleId), 10),
      },
    });

    res.json({ hasApplied: !!application });
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
