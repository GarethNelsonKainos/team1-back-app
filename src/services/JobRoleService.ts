import type { JobRoleDAO } from '../db/JobRoleDAO.js';
import { JobRoleMapper } from '../mappers/JobRoleMapper.js';
import type { JobRoleDetailedResponse } from '../models/JobRoleDetailedReponse.js';
import type { JobRoleResponse } from '../models/JobRoleResponse.js';

export interface CreateJobRoleInput {
  roleName: string;
  capabilityId: number;
  bandId: number;
  closingDate: Date;
  jobRoleStatusId: number;
  jobSpecLink?: string;
  openPositions?: number;
  description?: string;
  responsibilities?: string;
  locationIds: number[];
}

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

  async createJobRole(
    input: CreateJobRoleInput,
  ): Promise<JobRoleDetailedResponse> {
    const created = await this.jobRoleDAO.createJobRole(input);
    return JobRoleMapper.mapToJobRoleDetailedResponse(created);
  }
}

export { JobRoleService };
