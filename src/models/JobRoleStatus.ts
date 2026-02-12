import type { JobRole } from './JobRole';

interface JobRoleStatus {
  jobRoleStatusId: number;
  statusName: string;
  jobRoles?: JobRole[];
}

export type { JobRoleStatus };
