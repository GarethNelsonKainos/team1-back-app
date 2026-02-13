import type { JobRole } from './JobRole';

interface Band {
  bandId: number;
  bandName: string;
  jobRoles?: JobRole[];
}

export type { Band };
