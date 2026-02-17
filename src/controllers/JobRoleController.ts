import type { Request, Response } from 'express';
import ValidationError from '../errors/ValidationError.js';
import type { JobRoleService } from '../services/JobRoleService.js';
import { FEATURE_FLAGS } from '../utils/FeatureFlags.js';
import { validateCreateJobRole } from '../utils/validation.utils.js';

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

  async createJobRole(req: Request, res: Response): Promise<void> {
    console.log('Received request to create job role with data:', req.body);
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
      res.json(bands);
    } catch (error: unknown) {
      console.error('Error fetching bands:', error);
      res.status(500).json({ error: 'Failed to fetch bands' });
    }
  }

  async getCapabilities(req: Request, res: Response): Promise<void> {
    try {
      const capabilities = await this.jobRoleService.getCapabilities();
      res.json(capabilities);
    } catch (error: unknown) {
      console.error('Error fetching capabilities:', error);
      res.status(500).json({ error: 'Failed to fetch capabilities' });
    }
  }

  async getLocations(req: Request, res: Response): Promise<void> {
    try {
      const locations = await this.jobRoleService.getLocations();
      res.json(locations);
    } catch (error: unknown) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  }
}

export { JobRoleController };
