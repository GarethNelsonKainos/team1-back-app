import type { Request, Response } from 'express';
import type { JobRoleService } from '../services/JobRoleService.js';

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

  async getJobRoleById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid job role ID' });
    }
    const jobRole = await this.jobRoleService.getJobRoleDetailed(id);
    if (!jobRole) {
      return res.status(404).json({ error: 'Job role not found' });
    }
    return res.json(jobRole);
  }
}

export { JobRoleController };
