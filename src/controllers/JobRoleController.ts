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

  async createJobRole(req: Request, res: Response): Promise<Response> {
    const {
      roleName,
      capabilityId,
      bandId,
      closingDate,
      jobRoleStatusId,
      jobSpecLink,
      openPositions,
      description,
      responsibilities,
      locationIds,
    } = req.body as Record<string, unknown>;

    if (typeof roleName !== 'string' || roleName.trim().length === 0) {
      return res.status(400).json({ error: 'roleName is required' });
    }

    const parsedCapabilityId = Number(capabilityId);
    const parsedBandId = Number(bandId);
    const parsedStatusId = Number(jobRoleStatusId);

    if (
      Number.isNaN(parsedCapabilityId) ||
      Number.isNaN(parsedBandId) ||
      Number.isNaN(parsedStatusId)
    ) {
      return res
        .status(400)
        .json({ error: 'capabilityId, bandId, jobRoleStatusId are required' });
    }

    const parsedClosingDate = new Date(String(closingDate));
    if (Number.isNaN(parsedClosingDate.getTime())) {
      return res.status(400).json({ error: 'closingDate is invalid' });
    }

    if (!Array.isArray(locationIds) || locationIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'locationIds must be a non-empty array' });
    }

    const parsedLocationIds = locationIds.map((id) => Number(id));
    if (parsedLocationIds.some((id) => Number.isNaN(id))) {
      return res.status(400).json({ error: 'locationIds must be numbers' });
    }

    const parsedOpenPositions =
      openPositions === undefined || openPositions === null
        ? undefined
        : Number(openPositions);

    if (
      parsedOpenPositions !== undefined &&
      (Number.isNaN(parsedOpenPositions) || parsedOpenPositions < 0)
    ) {
      return res
        .status(400)
        .json({ error: 'openPositions must be a non-negative number' });
    }

    try {
      const created = await this.jobRoleService.createJobRole({
        roleName: roleName.trim(),
        capabilityId: parsedCapabilityId,
        bandId: parsedBandId,
        closingDate: parsedClosingDate,
        jobRoleStatusId: parsedStatusId,
        jobSpecLink: typeof jobSpecLink === 'string' ? jobSpecLink : undefined,
        openPositions: parsedOpenPositions,
        description: typeof description === 'string' ? description : undefined,
        responsibilities:
          typeof responsibilities === 'string' ? responsibilities : undefined,
        locationIds: parsedLocationIds,
      });

      return res.status(201).json(created);
    } catch (error: unknown) {
      console.error('Error creating job role:', error);
      return res.status(500).json({ error: 'Failed to create job role' });
    }
  }
}

export { JobRoleController };
