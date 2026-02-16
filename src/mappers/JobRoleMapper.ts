import type { RawJobRole } from '../db/JobRoleDAO.js';
import type { JobRoleDetailedResponse } from '../models/JobRoleDetailedReponse.js';
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

  static mapToJobRoleDetailedResponse(
    jobRole: RawJobRole,
  ): JobRoleDetailedResponse {
    return {
      jobRoleId: jobRole.jobRoleId,
      roleName: jobRole.roleName,
      location: jobRole.locations
        .map((l) => l.location.locationName)
        .join(', '),
      capability: jobRole.capability.capabilityName,
      band: jobRole.band.bandName,
      closingDate: jobRole.closingDate.toISOString(),
      description: jobRole.description ?? '',
      responsibilities: jobRole.responsibilities ?? '',
      jobSpecLink: jobRole.jobSpecLink ?? '',
      status: jobRole.status?.statusName || '',
      openPositions: jobRole.openPositions ?? 0,
    };
  }
}

export { JobRoleMapper };
