import type { JobRoleResponse } from './JobRoleResponse.js';

interface JobRoleDetailedResponse extends JobRoleResponse {
  description: string;
  responsibilities: string;
  jobSpecLink: string;
  status: string;
  openPositions: number;
}

export type { JobRoleDetailedResponse };
