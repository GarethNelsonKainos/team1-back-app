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

  describe('getJobRoleDetailed', () => {
    it('should return null if DAO returns null', async () => {
      const mockDAO = {
        getJobRoleById: vi.fn().mockResolvedValue(null),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);
      const result = await service.getJobRoleDetailed(123);

      expect(mockDAO.getJobRoleById).toHaveBeenCalledWith(123);
      expect(result).toBeNull();
    });

    it('should return mapped detailed job role from DAO', async () => {
      const mockRawJobRole = {
        jobRoleId: 2,
        roleName: 'Test Engineer',
        locations: [
          { location: { locationName: 'Belfast' } },
          { location: { locationName: 'Remote' } },
        ],
        capability: { capabilityName: 'Testing' },
        band: { bandName: 'Consultant' },
        closingDate: new Date('2026-04-01'),
        description: 'Ensures the quality of software products.',
        responsibilities: 'Test applications, report bugs, write test cases.',
        jobSpecLink: 'https://company.sharepoint.com/test-engineer',
        status: { statusName: 'Open' },
        openPositions: 2,
      };

      const mockDAO = {
        getJobRoleById: vi.fn().mockResolvedValue(mockRawJobRole),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);
      const result = await service.getJobRoleDetailed(2);

      expect(mockDAO.getJobRoleById).toHaveBeenCalledWith(2);
      expect(result).toEqual({
        jobRoleId: 2,
        roleName: 'Test Engineer',
        location: 'Belfast, Remote',
        capability: 'Testing',
        band: 'Consultant',
        closingDate: '2026-04-01T00:00:00.000Z',
        description: 'Ensures the quality of software products.',
        responsibilities: 'Test applications, report bugs, write test cases.',
        sharepointUrl: 'https://company.sharepoint.com/test-engineer',
        status: 'Open',
        openPositions: 2,
      });
    });

    it('should propagate errors from DAO', async () => {
      const mockError = new Error('DAO error');
      const mockDAO = {
        getJobRoleById: vi.fn().mockRejectedValue(mockError),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);

      await expect(service.getJobRoleDetailed(1)).rejects.toThrow('DAO error');
    });

    it('should handle missing optional fields gracefully', async () => {
      const mockRawJobRole = {
        jobRoleId: 3,
        roleName: 'Architect',
        locations: [{ location: { locationName: 'London' } }],
        capability: { capabilityName: 'Architecture' },
        band: { bandName: 'Principal' },
        closingDate: new Date('2026-05-01'),
        // description, responsibilities, jobSpecLink, status, openPositions are missing
      };

      const mockDAO = {
        getJobRoleById: vi.fn().mockResolvedValue(mockRawJobRole),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);
      const result = await service.getJobRoleDetailed(3);

      expect(result?.description).toBe('');
      expect(result?.responsibilities).toBe('');
      expect(result?.sharepointUrl).toBe('');
      expect(result?.status).toBe('');
      expect(result?.openPositions).toBe(0);
    });
  });

  describe('deleteJobRole', () => {
    it('should throw error for negative ID', async () => {
      const mockDAO = {
        deleteJobRole: vi.fn(),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);

      await expect(service.deleteJobRole(-1)).rejects.toThrow(
        'Invalid job role ID'
      );
      expect(mockDAO.deleteJobRole).not.toHaveBeenCalled();
    });

    it('should throw error for zero ID', async () => {
      const mockDAO = {
        deleteJobRole: vi.fn(),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);

      await expect(service.deleteJobRole(0)).rejects.toThrow(
        'Invalid job role ID'
      );
      expect(mockDAO.deleteJobRole).not.toHaveBeenCalled();
    });

    it('should throw error for decimal ID', async () => {
      const mockDAO = {
        deleteJobRole: vi.fn(),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);

      await expect(service.deleteJobRole(1.5)).rejects.toThrow(
        'Invalid job role ID'
      );
      expect(mockDAO.deleteJobRole).not.toHaveBeenCalled();
    });

    it('should call DAO deleteJobRole with valid ID', async () => {
      const mockDAO = {
        deleteJobRole: vi.fn().mockResolvedValue(undefined),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);
      await service.deleteJobRole(5);

      expect(mockDAO.deleteJobRole).toHaveBeenCalledWith(5);
    });

    it('should propagate DAO errors', async () => {
      const daoError = new Error('Database connection failed');
      const mockDAO = {
        deleteJobRole: vi.fn().mockRejectedValue(daoError),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);

      await expect(service.deleteJobRole(5)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
