import type { JobRole } from './JobRole.js';
import type { Location } from './Location.js';

interface JobRoleLocation {
  jobRoleId: number;
  locationId: number;
  jobRole?: JobRole;
  location?: Location;
}

export type { JobRoleLocation };
