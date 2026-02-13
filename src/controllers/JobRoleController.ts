import type { Request, Response } from 'express';
import type {
  CreateJobRoleInput,
  JobRoleService,
} from '../services/JobRoleService.js';

class JobRoleController {
  private jobRoleService: JobRoleService;

  constructor(jobRoleService: JobRoleService) {
    this.jobRoleService = jobRoleService;
  }

  async getJobRoles(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.jobRoleService.getJobRoles();
      res.json(response);
    } catch (error: unknown) {
      console.error('Error fetching job roles:', error);
      res.status(500).json({ error: 'Failed to fetch job roles' });
    }
  }

  async createJobRole(req: Request, res: Response): Promise<void> {
    try {
      const {
        roleName,
        capabilityId,
        bandId,
        closingDate,
        jobRoleStatusId,
        locationIds,
      } = req.body as CreateJobRoleInput & { closingDate: string };

      if (
        !roleName ||
        !capabilityId ||
        !bandId ||
        !closingDate ||
        !jobRoleStatusId
      ) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const parsedClosingDate = new Date(closingDate);
      if (Number.isNaN(parsedClosingDate.getTime())) {
        res.status(400).json({ error: 'Invalid closingDate' });
        return;
      }

      const createdJobRole = await this.jobRoleService.createJobRole({
        roleName,
        capabilityId,
        bandId,
        closingDate: parsedClosingDate,
        jobRoleStatusId,
        locationIds,
      });

      res.status(201).json(createdJobRole);
    } catch (error: unknown) {
      console.error('Create job role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export { JobRoleController };
