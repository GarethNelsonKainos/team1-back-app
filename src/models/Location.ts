import type { JobRoleLocation } from './JobRoleLocation';

interface Location {
  locationId: number;
  locationName: string;
  city: string;
  country: string;
  jobRoles?: JobRoleLocation[];
}

export type { Location };
