import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';
import { isJobApplicationsEnabled } from '../utils/FeatureFlags';

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

    const applicationService = new ApplicationService(prisma);
    const result = await applicationService.createApplication({
      jobRoleId: roleId,
      userId: user.userId,
    });

    if (!result) {
      res.status(400).json({
        error:
          'Unable to apply. Role may not be open or you may have already applied.',
      });
      return;
    }

    // For form submissions (multipart/form-data), redirect to success page
    // For API calls (application/json), return JSON response
    const contentType = req.headers['content-type'];

    if (contentType?.includes('application/x-www-form-urlencoded')) {
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
