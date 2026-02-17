import type { Application } from './Application.js';
import type { Band } from './Band.js';
import type { Capability } from './Capability.js';
import type { JobRoleLocation } from './JobRoleLocation.js';
import type { JobRoleStatus } from './JobRoleStatus.js';

interface JobRole {
  jobRoleId: number;
  roleName: string;
  capabilityId: number;
  bandId: number;
  closingDate: Date;
  jobRoleStatusId: number;
  capability?: Capability;
  band?: Band;
  status?: JobRoleStatus;
  locations?: JobRoleLocation[];
  applications?: Application[];
}

export type { JobRole };
