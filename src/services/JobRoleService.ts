import type { JobRoleDAO } from '../db/JobRoleDAO.js';
import { JobRoleMapper } from '../mappers/JobRoleMapper.js';

interface JobRoleResponse {
  jobRoleId: number;
  roleName: string;
  location: string;
  capability: string;
  band: string;
  closingDate: string;
}

class JobRoleService {
  constructor(private jobRoleDAO: JobRoleDAO) {}

  async getJobRoles(): Promise<JobRoleResponse[]> {
    const jobRoles = await this.jobRoleDAO.getJobRoles();
    return JobRoleMapper.mapToJobRoleResponse(jobRoles);
  }
}

export { JobRoleService, type JobRoleResponse };
