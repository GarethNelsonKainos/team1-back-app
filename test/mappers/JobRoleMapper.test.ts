import { describe, expect, it } from 'vitest';
import { JobRoleMapper } from '../../src/mappers/JobRoleMapper.js';

describe('JobRoleMapper', () => {
  describe('mapToJobRoleResponse', () => {
    it('should map job roles correctly', () => {
      const mockJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Software Engineer',
          locations: [
            {
              location: {
                locationName: 'London',
              },
            },
            {
              location: {
                locationName: 'Manchester',
              },
            },
          ],
          capability: {
            capabilityName: 'Engineering',
          },
          band: {
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
      const mockJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Engineer',
          locations: [{ location: { locationName: 'London' } }],
          capability: { capabilityName: 'Engineering' },
          band: { bandName: 'Mid' },
          closingDate: new Date('2026-03-15'),
        },
        {
          jobRoleId: 2,
          roleName: 'Designer',
          locations: [{ location: { locationName: 'Paris' } }],
          capability: { capabilityName: 'Design' },
          band: { bandName: 'Senior' },
          closingDate: new Date('2026-04-20'),
        },
      ];

      const result = JobRoleMapper.mapToJobRoleResponse(mockJobRoles);

      expect(result).toHaveLength(2);
      expect(result[0].jobRoleId).toBe(1);
      expect(result[1].jobRoleId).toBe(2);
    });

    it('should handle single location correctly', () => {
      const mockJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Role',
          locations: [{ location: { locationName: 'London' } }],
          capability: { capabilityName: 'Cap' },
          band: { bandName: 'Band' },
          closingDate: new Date('2026-03-15'),
        },
      ];

      const result = JobRoleMapper.mapToJobRoleResponse(mockJobRoles);

      expect(result[0].location).toBe('London');
    });
  });
});
