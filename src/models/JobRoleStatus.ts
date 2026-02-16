import type { JobRole } from './JobRole.js';

interface JobRoleStatus {
  jobRoleStatusId: number;
  statusName: string;
  jobRoles?: JobRole[];
}

export type { JobRoleStatus };
