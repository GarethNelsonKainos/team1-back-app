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
      const userId = 1;
      const roleId = Number.parseInt(String(jobRoleId), 10);

      if (!jobRoleId || Number.isNaN(roleId)) {
        res.status(400).json({ error: 'Invalid job role ID' });
        return;
      }

      if(!req.file) {
        res.status(400).json({ error: 'CV file is required' });
        return;
      }

      const result = await this.applicationService.createApplication({
        jobRoleId: roleId,
        userId: userId,
        cvFile: req.file,
      });

      if (!result) {
        console.error('Failed to create application for user:', userId, 'job role:', roleId);

        res.status(400).json({
          error:
            'Unable to apply. Role may not be open or you may have already applied.',
        });
        return;
      }

      console.log('Application created successfully for user:', userId, 'job role:', roleId);

      res.status(201).json({
        message: 'Application submitted successfully',
        application: result,
      });

    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
