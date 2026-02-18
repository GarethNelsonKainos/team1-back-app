import type { Request, Response } from 'express';
import type { ApplicationService } from '../services/application.service';
import { UserRole } from '../types/auth.types';
import { isJobApplicationsEnabled } from '../utils/FeatureFlags';

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor(applicationService: ApplicationService) {
    this.applicationService = applicationService;
  }

  async createApplication(req: Request, res: Response): Promise<void> {
    try {
      console.log('=== Application creation debug ===');
      console.log('req.body:', req.body);
      console.log('req.file:', req.file);
      console.log('req.files:', req.files);
      console.log('Content-Type:', req.headers['content-type']);
      console.log('User:', req.user?.userId);

      console.log(
        'Application creation endpoint hit by user:',
        req.user?.userId,
        'for job role:',
        req.body.jobRoleId,
      );

      if (!isJobApplicationsEnabled()) {
        res
          .status(503)
          .json({ error: 'Job applications are currently not available' });
        return;
      }

      const { jobRoleId } = req.body;
      const user = req.user;
      const roleId = Number.parseInt(String(jobRoleId), 10);

      if (!jobRoleId || Number.isNaN(roleId)) {
        res.status(400).json({ error: 'Invalid job role ID' });
        return;
      }

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (user.userRole !== UserRole.Applicant) {
        res.status(403).json({ error: 'Only applicants can apply for roles' });
        return;
      }

      const result = await this.applicationService.createApplication({
        jobRoleId: roleId,
        userId: user.userId,
        cvFile: req.file,
      });

      console.log(
        'Application creation result:',
        result ? `Application ID: ${result.applicationId}` : 'failed',
      );

      if (!result) {
        res.status(400).json({
          error:
            'Unable to apply. Role may not be open or you may have already applied.',
        });
        return;
      }

      // Check if this is a JavaScript/AJAX request vs traditional form submission
      const isJavaScriptRequest =
        req.headers.authorization ||
        req.headers['x-requested-with'] === 'XMLHttpRequest' ||
        req.headers.accept?.includes('application/json');
      if (isJavaScriptRequest) {
        // JavaScript/AJAX request - return JSON response
        res.status(201).json({
          message: 'Application submitted successfully',
          application: result,
        });
      } else {
        // Traditional form submission - redirect to success page
        res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/application-success`,
        );
      }
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async checkApplicationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobRoleId } = req.params;
      const user = req.user;

      console.log(
        'Checking application status for user:',
        user?.userId,
        'jobRole:',
        jobRoleId,
      );

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const hasApplied = await this.applicationService.hasUserApplied(
        user.userId,
        Number.parseInt(String(jobRoleId), 10),
      );

      console.log('Application status result:', hasApplied);
      res.json({ hasApplied });
    } catch (error) {
      console.error('Error checking application status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
