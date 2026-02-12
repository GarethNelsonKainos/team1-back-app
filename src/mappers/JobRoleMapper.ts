import type { RawJobRole } from '../db/JobRoleDAO.js';
import type { JobRoleResponse } from '../models/JobRoleResponse.js';

// biome-ignore lint/complexity/noStaticOnlyClass: JobRoleMapper is a simple static mapper class
class JobRoleMapper {
  static mapToJobRoleResponse(jobRoles: RawJobRole[]): JobRoleResponse[] {
    return jobRoles.map((jr) => ({
      jobRoleId: jr.jobRoleId,
      roleName: jr.roleName,
      location: jr.locations.map((l) => l.location.locationName).join(', '),
      capability: jr.capability.capabilityName,
      band: jr.band.bandName,
      closingDate: jr.closingDate.toISOString(),
    }));
  }
}

export { JobRoleMapper };
