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

  /**
   * Handles DELETE /job-roles/:id
   */
  async deleteJobRole(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid job role ID' });
      return;
    }
    
    try {
      await this.jobRoleService.deleteJobRole(id);
      res.status(204).send();
    } catch (error: unknown) {
      // Narrow error type for safe property access
      if (
        typeof error === 'object' &&
        error !== null &&
        ('code' in error || 'message' in error)
      ) {
        const errObj = error as { code?: string; message?: string };
        if (errObj.code === 'P2025' || errObj.message?.includes('not found')) {
          res.status(404).json({ error: 'Job role not found' });
          return;
        }
        if (errObj.message === 'Invalid job role ID') {
          res.status(400).json({ error: 'Invalid job role ID' });
          return;
        }
      }
      console.error('Error deleting job role:', error);
      res.status(500).json({ error: 'Failed to delete job role' });
    }
  }
}

export { JobRoleController };
