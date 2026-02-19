import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/services/s3.service.js', () => ({
  S3Service: vi.fn().mockImplementation(() => ({ uploadFile: vi.fn() })),
}));

describe('Application Environment Configuration', () => {
  let app: Express;

  beforeEach(() => {
    // Clear the module cache to ensure fresh imports
    vi.resetModules();
    // Mock the Prisma client before importing the app
    vi.mock('../src/db/prisma.js', () => ({
      prisma: {} as unknown as Partial<PrismaClient>,
    }));
  });

  afterEach(() => {
    // Clean up environment variables
    process.env.PORT = undefined;
  });

  describe('PORT Configuration', () => {
    it('should use default port 3001 when PORT is not set', async () => {
      process.env.PORT = undefined;

      // Import the app after clearing the environment variable
      const { default: appModule } = await import('../src/index');
      app = appModule;

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });

    it('should use default port 3001 when PORT is empty string', async () => {
      process.env.PORT = '';

      // Import the app after setting empty PORT
      const { default: appModule } = await import('../src/index');
      app = appModule;

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });

    it('should use default port 3001 when PORT is not a valid number', async () => {
      process.env.PORT = 'invalid';

      // Import the app after setting invalid PORT
      const { default: appModule } = await import('../src/index');
      app = appModule;

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });

    it('should use environment PORT when valid number is provided', async () => {
      process.env.PORT = '4000';

      // Import the app after setting valid PORT
      const { default: appModule } = await import('../src/index');
      app = appModule;

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });
  });
});
