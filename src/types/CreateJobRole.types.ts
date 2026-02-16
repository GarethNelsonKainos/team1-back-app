export interface CreateJobRoleRequest {
  roleName: string;
  capabilityId: number;
  bandId: number;
  description: string;
  responsibilities: string;
  jobSpecLink: string;
  openPositions: number;
  locationIds: number[];
  closingDate: string;
}

export interface CreateJobRoleResponse {
  jobRoleId: number;
  message: string;
}
