import type { JobRole } from './JobRole.js';

interface Capability {
  capabilityId: number;
  capabilityName: string;
  jobRoles?: JobRole[];
}

export type { Capability };
