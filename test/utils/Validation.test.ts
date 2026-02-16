import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  createJobRoleSchema,
  validateCreateJobRole,
} from '../../src/utils/validation.utils';

describe('validation.utils', () => {
  describe('validateCreateJobRole', () => {
    const validData = {
      roleName: 'Senior Software Engineer',
      capabilityId: 1,
      bandId: 2,
      description: 'Test description for the role',
      responsibilities: 'Test responsibilities for the role',
      jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
      openPositions: 2,
      locationIds: [1, 2],
      closingDate: '2026-12-31T00:00:00.000Z',
    };

    it('should validate correct data', () => {
      const result = validateCreateJobRole(validData);
      expect(result).toEqual(validData);
    });

    it('should throw error for short role name', () => {
      const invalidData = { ...validData, roleName: 'AB' };
      expect(() => validateCreateJobRole(invalidData)).toThrow();
    });

    it('should throw error for invalid capability ID', () => {
      const invalidData = { ...validData, capabilityId: -1 };
      expect(() => validateCreateJobRole(invalidData)).toThrow();
    });

    it('should throw error for invalid band ID', () => {
      const invalidData = { ...validData, bandId: 0 };
      expect(() => validateCreateJobRole(invalidData)).toThrow();
    });

    it('should throw error for short description', () => {
      const invalidData = { ...validData, description: 'Short' };
      expect(() => validateCreateJobRole(invalidData)).toThrow();
    });

    it('should throw error for invalid SharePoint link', () => {
      const invalidData = { ...validData, jobSpecLink: 'https://google.com' };
      expect(() => validateCreateJobRole(invalidData)).toThrow();
    });

    it('should throw error for zero open positions', () => {
      const invalidData = { ...validData, openPositions: 0 };
      expect(() => validateCreateJobRole(invalidData)).toThrow();
    });

    it('should throw error for empty locationIds', () => {
      const invalidData = { ...validData, locationIds: [] };
      expect(() => validateCreateJobRole(invalidData)).toThrow();
    });

    it('should throw error for invalid date format', () => {
      const invalidData = { ...validData, closingDate: 'invalid-date' };
      expect(() => validateCreateJobRole(invalidData)).toThrow();
    });
  });
});
