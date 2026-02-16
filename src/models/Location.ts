import type { JobRoleLocation } from './JobRoleLocation.js';

interface Location {
  locationId: number;
  locationName: string;
  city: string;
  country: string;
  jobRoles?: JobRoleLocation[];
}

export type { Location };
