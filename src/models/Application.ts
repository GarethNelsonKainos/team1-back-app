import type { ApplicationStatus } from './ApplicationStatus';
import type { JobRole } from './JobRole';
import type { User } from './User';

interface Application {
  applicationId: number;
  userId: number;
  jobRoleId: number;
  applicationStatusId: number;
  createdAt: Date;
  user?: User;
  jobRole?: JobRole;
  status?: ApplicationStatus;
}

export type { Application };
