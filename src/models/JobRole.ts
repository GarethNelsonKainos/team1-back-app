import type { Application } from './Application';
import type { Band } from './Band';
import type { Capability } from './Capability';
import type { JobRoleLocation } from './JobRoleLocation';
import type { JobRoleStatus } from './JobRoleStatus';

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
