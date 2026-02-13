import type { JobRoleDAO } from '../db/JobRoleDAO.js';
import { JobRoleMapper } from '../mappers/JobRoleMapper.js';
import type { JobRoleResponse } from '../models/JobRoleResponse.js';

class JobRoleService {
  constructor(private jobRoleDAO: JobRoleDAO) {}

  async getJobRoles(): Promise<JobRoleResponse[]> {
    const jobRoles = await this.jobRoleDAO.getJobRoles();
    return JobRoleMapper.mapToJobRoleResponse(jobRoles);
  }
}

export { JobRoleService };
