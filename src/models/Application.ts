import type { ApplicationStatus } from './ApplicationStatus.js';
import type { JobRole } from './JobRole.js';
import type { User } from './User.js';

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
