import type { Request, Response } from 'express';
import { JobRoleDAO } from '../db/JobRoleDAO.js';
import { prisma } from '../db/prisma.js';
import { JobRoleService } from '../services/JobRoleService.js';

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
}

export { JobRoleController };
export const jobRoleController = new JobRoleController(
  new JobRoleService(new JobRoleDAO(prisma)),
);
