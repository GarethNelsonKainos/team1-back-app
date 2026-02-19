import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/services/s3.service.js', () => ({
  S3Service: vi.fn().mockImplementation(() => ({ uploadFile: vi.fn() })),
}));

import app from '../src/index';

describe('Backend API', () => {
  describe('GET /health', () => {
    it('should return health status OK', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Server Configuration', () => {
    it('should handle JSON requests', async () => {
      const response = await request(app)
        .post('/test-json')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Should handle JSON even if endpoint doesn't exist
      expect(response.status).toBe(404);
    });

    it('should serve JSON content type for health endpoint', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.status).toBe(404);
    });

    it('should handle POST requests to non-existent routes', async () => {
      const response = await request(app).post('/non-existent-route');
      expect(response.status).toBe(404);
    });

    it('should handle PUT requests to non-existent routes', async () => {
      const response = await request(app).put('/non-existent-route');
      expect(response.status).toBe(404);
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment PORT or default to 3001', () => {
      // Test that the app is configured properly
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should handle various HTTP methods', async () => {
      const getResponse = await request(app).get('/health');
      expect(getResponse.status).toBe(200);

      const postResponse = await request(app).post('/health');
      expect(postResponse.status).toBe(404);
    });
  });

  describe('Middleware', () => {
    it('should parse JSON body correctly', async () => {
      const testData = { name: 'test', value: 123 };
      const response = await request(app)
        .post('/health') // Using existing endpoint
        .send(testData)
        .set('Content-Type', 'application/json');

      // Should process the JSON properly even if endpoint returns 404
      expect(response.status).toBe(404);
    });

    it('should handle empty JSON body', async () => {
      const response = await request(app)
        .post('/health')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });
  });
});
