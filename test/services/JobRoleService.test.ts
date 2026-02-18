import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JobRoleDAO } from '../../src/db/JobRoleDAO';
import { JobRoleService } from '../../src/services/JobRoleService';

describe('JobRoleService - New Methods', () => {
  let jobRoleService: JobRoleService;
  let mockJobRoleDAO: {
    getJobRoles: ReturnType<typeof vi.fn>;
    getJobRoleById: ReturnType<typeof vi.fn>;
    createJobRole: ReturnType<typeof vi.fn>;
    getBands: ReturnType<typeof vi.fn>;
    getCapabilities: ReturnType<typeof vi.fn>;
    getLocations: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockJobRoleDAO = {
      getJobRoles: vi.fn(),
      getJobRoleById: vi.fn(),
      createJobRole: vi.fn(),
      getBands: vi.fn(),
      getCapabilities: vi.fn(),
      getLocations: vi.fn(),
    };
    jobRoleService = new JobRoleService(
      mockJobRoleDAO as unknown as JobRoleDAO,
    );
  });

  describe('createJobRole', () => {
    it('should create a job role successfully', async () => {
      const mockJobRole = {
        jobRoleId: 1,
        roleName: 'Senior Software Engineer',
      };
      mockJobRoleDAO.createJobRole.mockResolvedValue(mockJobRole);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const result = await jobRoleService.createJobRole({
        roleName: 'Senior Software Engineer',
        capabilityId: 1,
        bandId: 2,
        description: 'Test description for job role',
        responsibilities: 'Test responsibilities for job role',
        jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
        openPositions: 2,
        locationIds: [1, 2],
        closingDate: futureDate.toISOString(),
      });

      expect(mockJobRoleDAO.createJobRole).toHaveBeenCalled();
      expect(result).toEqual({
        jobRoleId: 1,
        message: 'Job role created successfully',
      });
    });

    it('should throw error if closing date is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await expect(
        jobRoleService.createJobRole({
          roleName: 'Test Role',
          capabilityId: 1,
          bandId: 1,
          description: 'Test description',
          responsibilities: 'Test responsibilities',
          jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
          openPositions: 1,
          locationIds: [1],
          closingDate: pastDate.toISOString(),
        }),
      ).rejects.toThrow('Closing date must be in the future');

      expect(mockJobRoleDAO.createJobRole).not.toHaveBeenCalled();
    });

    it('should throw error if closing date is today', async () => {
      const today = new Date();

      await expect(
        jobRoleService.createJobRole({
          roleName: 'Test Role',
          capabilityId: 1,
          bandId: 1,
          description: 'Test description',
          responsibilities: 'Test responsibilities',
          jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
          openPositions: 1,
          locationIds: [1],
          closingDate: today.toISOString(),
        }),
      ).rejects.toThrow('Closing date must be in the future');
    });
  });

  describe('getBands', () => {
    it('should return all bands', async () => {
      const mockBands = [
        { bandId: 1, bandName: 'Associate' },
        { bandId: 2, bandName: 'Senior Associate' },
      ];
      mockJobRoleDAO.getBands.mockResolvedValue(mockBands);

      const result = await jobRoleService.getBands();

      expect(mockJobRoleDAO.getBands).toHaveBeenCalled();
      expect(result).toEqual(mockBands);
    });
  });

  describe('getCapabilities', () => {
    it('should return all capabilities', async () => {
      const mockCapabilities = [
        { capabilityId: 1, capabilityName: 'Engineering' },
        { capabilityId: 2, capabilityName: 'Data' },
      ];
      mockJobRoleDAO.getCapabilities.mockResolvedValue(mockCapabilities);

      const result = await jobRoleService.getCapabilities();

      expect(mockJobRoleDAO.getCapabilities).toHaveBeenCalled();
      expect(result).toEqual(mockCapabilities);
    });
  });

  describe('getLocations', () => {
    it('should return all locations', async () => {
      const mockLocations = [
        {
          locationId: 1,
          locationName: 'Belfast',
          city: 'Belfast',
          country: 'UK',
        },
        {
          locationId: 2,
          locationName: 'London',
          city: 'London',
          country: 'UK',
        },
      ];
      mockJobRoleDAO.getLocations.mockResolvedValue(mockLocations);

      const result = await jobRoleService.getLocations();

      expect(mockJobRoleDAO.getLocations).toHaveBeenCalled();
      expect(result).toEqual(mockLocations);
    });
  });

  describe('deleteJobRole', () => {
    it('should throw error for negative ID', async () => {
      const mockDAO = {
        deleteJobRole: vi.fn(),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);

      await expect(service.deleteJobRole(-1)).rejects.toThrow(
        'Invalid job role ID',
      );
      expect(mockDAO.deleteJobRole).not.toHaveBeenCalled();
    });
    it('should throw error for zero ID', async () => {
      const mockDAO = {
        deleteJobRole: vi.fn(),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);

      await expect(service.deleteJobRole(0)).rejects.toThrow(
        'Invalid job role ID',
      );
      expect(mockDAO.deleteJobRole).not.toHaveBeenCalled();
    });
    it('should throw error for decimal ID', async () => {
      const mockDAO = {
        deleteJobRole: vi.fn(),
      } as unknown as JobRoleDAO;

      const service = new JobRoleService(mockDAO);

      await expect(service.deleteJobRole(1.5)).rejects.toThrow(
        'Invalid job role ID',
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
        'Database connection failed',
      );
    });
  });
});
