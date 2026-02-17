import type { Request, Response } from 'express';
import type { ApplicationService } from '../services/application.service';
import { isJobApplicationsEnabled } from '../utils/FeatureFlags';

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor(applicationService: ApplicationService) {
    this.applicationService = applicationService;
  }

  async createApplication(req: Request, res: Response): Promise<void> {
    try {
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

      if (user.userTypeId !== 1) {
        res.status(403).json({ error: 'Only applicants can apply for roles' });
        return;
      }

      const result = await this.applicationService.createApplication({
        jobRoleId: roleId,
        userId: user.userId,
        cvFile: req.file,
      });

      if (!result) {
        res.status(400).json({
          error:
            'Unable to apply. Role may not be open or you may have already applied.',
        });
        return;
      }

      res.status(201).json({
        message: 'Application submitted successfully',
        application: result,
      });
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async checkApplicationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobRoleId } = req.params;
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const hasApplied = await this.applicationService.hasUserApplied(
        user.userId,
        Number.parseInt(String(jobRoleId), 10),
      );

      res.json({ hasApplied });
    } catch (error) {
      console.error('Error checking application status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
