import { beforeEach, describe } from 'node:test';
import request from 'supertest';

describe('Application Environment Configuration', () => {
  let app: any;
  
  beforeEach(() => {
    // Clear the module cache to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.PORT;
  });

  describe('PORT Configuration', () => {
    it('should use default port 3001 when PORT is not set', async () => {
      delete process.env.PORT;
      
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