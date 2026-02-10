import { getJobRoles } from '../queries/jobRoles.js';
import type { JobRoleResponse } from '../models/JobRoleResponse.js';

export async function fetchJobRoles(): Promise<JobRoleResponse[]> {
  try {
    const roles = await getJobRoles();
    return roles;
  } catch (error) {
    console.error('Error fetching job roles:', error);
    throw new Error('Failed to fetch job roles');
  }
}
