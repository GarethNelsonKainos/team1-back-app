// test/auth.handler.test.ts

import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthController from '../src/controllers/AuthController.js';
import type { AuthService } from '../src/services/AuthService.js';

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Response;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let mockAuthService: {
    login: ReturnType<typeof vi.fn>;
    logout?: ReturnType<typeof vi.fn>;
  };
  let controller: AuthController;

  beforeEach(() => {
    jsonMock = vi.fn().mockImplementation(function (this: Response) {
      return this;
    });
    statusMock = vi.fn().mockImplementation(function (this: Response) {
      return this;
    });

    mockReq = {
      body: {},
    };

    // Create a mockRes object with correct chaining
    mockRes = {
      status: statusMock,
      json: jsonMock,
      // Add any other Response methods used in your controller if needed
    } as unknown as Response;

    mockAuthService = {
      login: vi.fn(),
    };

    controller = new AuthController(mockAuthService as unknown as AuthService);
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return 400 for invalid credentials', async () => {
      mockReq.body = { password: 'password123' };

      await controller.login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 when authentication fails', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'GoodPassword123',
      };
      mockAuthService.login.mockResolvedValue(null);

      await controller.login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return token on successful login', async () => {
      const mockToken = 'mock-jwt-token';
      mockReq.body = {
        email: 'test@example.com',
        password: 'GoodPassword123',
      };
      mockAuthService.login.mockResolvedValue({ token: mockToken });

      await controller.login(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ token: mockToken });
    });

    it('should handle errors during login', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'GoodPassword123',
      };
      mockAuthService.login.mockRejectedValue(new Error('Database error'));

      await controller.login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});
