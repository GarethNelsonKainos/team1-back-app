import { describe, expect, it } from 'vitest';
import type { RawJobRole } from '../../src/db/JobRoleDAO.js';
import { JobRoleMapper } from '../../src/mappers/JobRoleMapper.js';

describe('JobRoleMapper', () => {
  describe('mapToJobRoleResponse', () => {
    it('should map job roles correctly', () => {
      const mockJobRoles: RawJobRole[] = [
        {
          jobRoleId: 1,
          roleName: 'Software Engineer',
          locations: [
            {
              location: {
                locationId: 1,
                locationName: 'London',
                city: 'London',
                country: 'UK',
              },
            },
            {
              location: {
                locationId: 2,
                locationName: 'Manchester',
                city: 'Manchester',
                country: 'UK',
              },
            },
          ],
          capability: {
            capabilityId: 1,
            capabilityName: 'Engineering',
          },
          band: {
            bandId: 1,
            bandName: 'Mid-Level',
          },
          closingDate: new Date('2026-03-15'),
        },
      ];

      const result = JobRoleMapper.mapToJobRoleResponse(mockJobRoles);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        location: 'London, Manchester',
        capability: 'Engineering',
        band: 'Mid-Level',
        closingDate: '2026-03-15T00:00:00.000Z',
      });
    });

    it('should handle multiple job roles', () => {
      const mockJobRoles: RawJobRole[] = [
        {
          jobRoleId: 1,
          roleName: 'Engineer',
          locations: [
            {
              location: {
                locationId: 1,
                locationName: 'London',
                city: 'London',
                country: 'UK',
              },
            },
          ],
          capability: { capabilityId: 1, capabilityName: 'Engineering' },
          band: { bandId: 1, bandName: 'Mid' },
          closingDate: new Date('2026-03-15'),
        },
        {
          jobRoleId: 2,
          roleName: 'Designer',
          locations: [
            {
              location: {
                locationId: 2,
                locationName: 'Paris',
                city: 'Paris',
                country: 'France',
              },
            },
          ],
          capability: { capabilityId: 2, capabilityName: 'Design' },
          band: { bandId: 2, bandName: 'Senior' },
          closingDate: new Date('2026-04-20'),
        },
      ];

      const result = JobRoleMapper.mapToJobRoleResponse(mockJobRoles);

      expect(result).toHaveLength(2);
      expect(result[0].jobRoleId).toBe(1);
      expect(result[1].jobRoleId).toBe(2);
    });

    it('should handle single location correctly', () => {
      const mockJobRoles: RawJobRole[] = [
        {
          jobRoleId: 1,
          roleName: 'Role',
          locations: [
            {
              location: {
                locationId: 1,
                locationName: 'London',
                city: 'London',
                country: 'UK',
              },
            },
          ],
          capability: { capabilityId: 1, capabilityName: 'Cap' },
          band: { bandId: 1, bandName: 'Band' },
          closingDate: new Date('2026-03-15'),
        },
      ];

      const result = JobRoleMapper.mapToJobRoleResponse(mockJobRoles);

      expect(result[0].location).toBe('London');
    });
  });
});
