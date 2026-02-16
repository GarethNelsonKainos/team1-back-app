// test/auth.handler.test.ts

import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loginHandler, logoutHandler } from '../src/handlers/auth.handler';
import { AuthService } from '../src/services/auth.service';

// Mock the AuthService
vi.mock('../src/services/auth.service');

describe('auth.handler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Response;
  let mockPrisma: PrismaClient;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let mockAuthService: {
    login: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      body: {},
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    mockPrisma = {} as PrismaClient;

    mockAuthService = {
      login: vi.fn(),
    };

    // Mock the AuthService constructor to return our mock
    vi.mocked(AuthService).mockImplementation(
      () => mockAuthService as unknown as AuthService,
    );

    vi.clearAllMocks();
  });

  describe('loginHandler', () => {
    it('should return 400 for missing email', async () => {
      mockReq.body = { password: 'password123' };

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for missing password', async () => {
      mockReq.body = { email: 'test@example.com' };

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for non-string email', async () => {
      mockReq.body = { email: 123, password: 'password123' };

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for non-string password', async () => {
      mockReq.body = { email: 'test@example.com', password: 123 };

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for invalid email format', async () => {
      mockReq.body = { email: 'notanemail', password: 'password123' };

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for email too long', async () => {
      const longEmail = `${'a'.repeat(250)}@example.com`;
      mockReq.body = { email: longEmail, password: 'password123' };

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for password too long', async () => {
      const longPassword = 'a'.repeat(130);
      mockReq.body = { email: 'test@example.com', password: longPassword };

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for password too short', async () => {
      mockReq.body = { email: 'test@example.com', password: 'short' };

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 for non-existent user', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      mockAuthService.login.mockResolvedValue(null);

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid email or password',
      });
    });

    it('should return 401 for wrong password', async () => {
      mockReq.body = { email: 'test@example.com', password: 'wrongpassword' };
      mockAuthService.login.mockResolvedValue(null);

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid email or password',
      });
    });

    it('should return token and user for valid credentials', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };

      const mockResult = {
        token: 'mock-jwt-token',
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(jsonMock).toHaveBeenCalledWith(mockResult);
    });

    it('should sanitize email (trim and lowercase)', async () => {
      mockReq.body = { email: '  Test@Example.COM  ', password: 'password123' };

      const mockResult = {
        token: 'mock-jwt-token',
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return 500 for database error', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      mockAuthService.login.mockRejectedValue(new Error('Database error'));

      await loginHandler(mockReq as Request, mockRes as Response, mockPrisma);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('logoutHandler', () => {
    it('should return success message', () => {
      logoutHandler(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });
});
