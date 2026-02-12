import type { JobRoleLocation, RawJobRole } from '../db/JobRoleDAO.js';
import type { JobRoleResponse } from '../services/JobRoleService.js';

class JobRoleMapper {
  static mapToJobRoleResponse(jobRoles: RawJobRole[]): JobRoleResponse[] {
    return jobRoles.map((jr) => ({
      jobRoleId: jr.jobRoleId,
      roleName: jr.roleName,
      location: jr.locations
        .map((l: JobRoleLocation) => l.location.locationName)
        .join(', '),
      capability: jr.capability.capabilityName,
      band: jr.band.bandName,
      closingDate: jr.closingDate.toISOString(),
    }));
  }
}

export { JobRoleMapper };
