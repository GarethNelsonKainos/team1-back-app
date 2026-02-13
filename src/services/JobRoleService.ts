import type {
  CreateJobRoleInput,
  JobRoleDAO,
  JobRoleWithDetails,
  RawJobRole,
} from '../db/JobRoleDAO.js';
import { JobRoleMapper } from '../mappers/JobRoleMapper.js';
import type { JobRoleResponse } from '../models/JobRoleResponse.js';

class JobRoleService {
  constructor(private jobRoleDAO: JobRoleDAO) {}

  async getJobRoles(): Promise<JobRoleResponse[]> {
    const jobRoles = await this.jobRoleDAO.getJobRoles();
    return JobRoleMapper.mapToJobRoleResponse(jobRoles);
  }

  async getJobRoleById(id: number): Promise<JobRoleResponse | null> {
    const jobRole = await this.jobRoleDAO.getJobRoleById(id);
    if (!jobRole) return null;
    return JobRoleMapper.mapToJobRoleResponse([jobRole])[0] ?? null;
  }

  async createJobRole(input: CreateJobRoleInput): Promise<JobRoleWithDetails> {
    return await this.jobRoleDAO.createJobRole(input);
  }
}

export { JobRoleService };
export type { CreateJobRoleInput, JobRoleWithDetails };
