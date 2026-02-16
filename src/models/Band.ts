import type { JobRole } from './JobRole.js';

interface Band {
  bandId: number;
  bandName: string;
  jobRoles?: JobRole[];
}

export type { Band };
