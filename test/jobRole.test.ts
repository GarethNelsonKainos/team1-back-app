import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/index.js';

describe('Job Role Integration Tests', () => {
  describe('GET /api/job-roles', () => {
    it('should return a list of job roles', async () => {
      const response = await request(app).get('/api/job-roles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return job roles with correct structure', async () => {
      const response = await request(app).get('/api/job-roles');

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        const jobRole = response.body[0];
        expect(jobRole).toHaveProperty('jobRoleId');
        expect(jobRole).toHaveProperty('roleName');
        expect(jobRole).toHaveProperty('location');
        expect(jobRole).toHaveProperty('capability');
        expect(jobRole).toHaveProperty('band');
        expect(jobRole).toHaveProperty('closingDate');
      }
    });

    it('should return job roles in correct format', async () => {
      const response = await request(app).get('/api/job-roles');

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        const jobRole = response.body[0];
        expect(typeof jobRole.jobRoleId).toBe('number');
        expect(typeof jobRole.roleName).toBe('string');
        expect(typeof jobRole.location).toBe('string');
        expect(typeof jobRole.capability).toBe('string');
        expect(typeof jobRole.band).toBe('string');
        expect(typeof jobRole.closingDate).toBe('string');
      }
    });
  });
});
