import type { JobRole } from './JobRole';
import type { Location } from './Location';

interface JobRoleLocation {
  jobRoleId: number;
  locationId: number;
  jobRole?: JobRole;
  location?: Location;
}

export type { JobRoleLocation };
