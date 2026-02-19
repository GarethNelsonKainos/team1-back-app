import type { JobRoleDAO } from '../db/JobRoleDAO.js';
import { JobRoleMapper } from '../mappers/JobRoleMapper.js';
import type { JobRoleDetailedResponse } from '../models/JobRoleDetailedReponse.js';
import type { JobRoleResponse } from '../models/JobRoleResponse.js';
import type { CreateJobRoleRequest } from '../types/CreateJobRole.types.js';

class JobRoleService {
  constructor(private jobRoleDAO: JobRoleDAO) {}

  async getJobRoles(): Promise<JobRoleResponse[]> {
    const jobRoles = await this.jobRoleDAO.getJobRoles();
    return JobRoleMapper.mapToJobRoleResponse(jobRoles);
  }

  async getJobRoleDetailed(
    id: number,
  ): Promise<JobRoleDetailedResponse | null> {
    const jobRole = await this.jobRoleDAO.getJobRoleById(id);
    if (!jobRole) {
      return null;
    }
    return JobRoleMapper.mapToJobRoleDetailedResponse(jobRole);
  }

  /**
   * Deletes a job role and all associated applications (hard delete).
   * Throws if the job role does not exist or id is invalid.
   */
  async deleteJobRole(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid job role ID');
    }
    await this.jobRoleDAO.deleteJobRole(id);
  }

  async createJobRole(data: CreateJobRoleRequest) {
    const closingDate = new Date(data.closingDate);

    if (closingDate <= new Date()) {
      throw new Error('Closing date must be in the future');
    }

    const jobRole = await this.jobRoleDAO.createJobRole({
      ...data,
      closingDate,
    });

    return {
      jobRoleId: jobRole.jobRoleId,
      message: 'Job role created successfully',
    };
  }

  async getBands() {
    return await this.jobRoleDAO.getBands();
  }

  async getCapabilities() {
    return await this.jobRoleDAO.getCapabilities();
  }

  async getLocations() {
    return await this.jobRoleDAO.getLocations();
  }
}

export { JobRoleService };
