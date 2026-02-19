import type { Request, Response } from 'express';
import ValidationError from '../errors/ValidationError.js';
import type { JobRoleService } from '../services/JobRoleService.js';
import { FEATURE_FLAGS } from '../utils/FeatureFlags.js';
import { parseError } from '../utils/error.utils.js';
import { validateCreateJobRole } from '../utils/validation.utils.js';

class JobRoleController {
  private jobRoleService: JobRoleService;

  constructor(jobRoleService: JobRoleService) {
    this.jobRoleService = jobRoleService;
  }

  async getJobRoles(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.jobRoleService.getJobRoles();
      res.status(200).json(response);
    } catch (error: unknown) {
      console.error('Error fetching job roles:', error);
      res.status(500).json({ error: 'Failed to fetch job roles' });
    }
  }

  async getJobRoleById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: 'Invalid job role ID' });
        return;
      }
      const jobRole = await this.jobRoleService.getJobRoleDetailed(id);
      if (!jobRole) {
        res.status(404).json({ error: 'Job role not found' });
        return;
      }
      res.status(200).json(jobRole);
    } catch (error: unknown) {
      console.error('Error fetching job role:', error);
      res.status(500).json({ error: 'Failed to fetch job role' });
    }
  }

  async createJobRole(req: Request, res: Response): Promise<void> {
    if (!FEATURE_FLAGS.ADMIN_CREATE_JOB_ROLE) {
      res.status(404).json({ error: 'Feature not available' });
      return;
    }

    try {
      const validatedData = validateCreateJobRole(req.body);
      const result = await this.jobRoleService.createJobRole(validatedData);
      res.status(201).json(result);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        console.error('Validation error creating job role:', error.message);
        res.status(400).json({ error: error.message });
      } else if (error instanceof Error) {
        console.error('Error creating job role:', error);
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create job role' });
      }
    }
  }

  async getBands(req: Request, res: Response): Promise<void> {
    try {
      const bands = await this.jobRoleService.getBands();
      res.status(200).json(bands);
    } catch (error: unknown) {
      console.error('Error fetching bands:', error);
      res.status(500).json({ error: 'Failed to fetch bands' });
    }
  }

  async getCapabilities(req: Request, res: Response): Promise<void> {
    try {
      const capabilities = await this.jobRoleService.getCapabilities();
      res.status(200).json(capabilities);
    } catch (error: unknown) {
      console.error('Error fetching capabilities:', error);
      res.status(500).json({ error: 'Failed to fetch capabilities' });
    }
  }

  async getLocations(req: Request, res: Response): Promise<void> {
    try {
      const locations = await this.jobRoleService.getLocations();
      res.status(200).json(locations);
    } catch (error: unknown) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
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
      const { message, statusCode } = parseError(error);
      console.error('Error deleting job role:', error);
      res.status(statusCode).json({ error: message });
    }
  }
}
export { JobRoleController };
