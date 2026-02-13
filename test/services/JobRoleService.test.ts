import { describe, expect, it, vi } from 'vitest';
import type { JobRoleDAO } from '../../src/db/JobRoleDAO.js';
import { JobRoleService } from '../../src/services/JobRoleService.js';

describe('JobRoleService', () => {
  describe('getJobRoles', () => {
    it('should return mapped job roles from DAO', async () => {
      const mockRawJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Software Engineer',
          locations: [
            {
              location: {
                locationName: 'London',
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

      const mockDAO = {
        getJobRoles: vi.fn().mockResolvedValue(mockRawJobRoles),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);
      const result = await service.getJobRoles();

      expect(mockDAO.getJobRoles).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        jobRoleId: 1,
        roleName: 'Software Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Mid-Level',
        closingDate: '2026-03-15T00:00:00.000Z',
      });
    });

    it('should handle empty results', async () => {
      const mockDAO = {
        getJobRoles: vi.fn().mockResolvedValue([]),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);
      const result = await service.getJobRoles();

      expect(result).toEqual([]);
    });

    it('should propagate errors from DAO', async () => {
      const mockError = new Error('DAO error');
      const mockDAO = {
        getJobRoles: vi.fn().mockRejectedValue(mockError),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);

      await expect(service.getJobRoles()).rejects.toThrow('DAO error');
    });

    it('should map multiple locations correctly', async () => {
      const mockRawJobRoles = [
        {
          jobRoleId: 1,
          roleName: 'Engineer',
          locations: [
            { location: { locationName: 'London' } },
            { location: { locationName: 'Berlin' } },
            { location: { locationName: 'Amsterdam' } },
          ],
          capability: { capabilityName: 'Engineering' },
          band: { bandName: 'Senior' },
          closingDate: new Date('2026-03-15'),
        },
      ];

      const mockDAO = {
        getJobRoles: vi.fn().mockResolvedValue(mockRawJobRoles),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);
      const result = await service.getJobRoles();

      expect(result[0].location).toBe('London, Berlin, Amsterdam');
    });
  });
});
