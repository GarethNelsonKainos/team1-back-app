import type { JobRole } from './JobRole';

interface Capability {
  capabilityId: number;
  capabilityName: string;
  jobRoles?: JobRole[];
}

export type { Capability };
