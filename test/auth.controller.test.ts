// test/auth.controller.test.ts

import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loginController,
  logoutController,
} from '../src/controllers/auth.controller';
import * as jwtUtils from '../src/utils/jwt.utils';
import * as passwordUtils from '../src/utils/password.utils';

describe('auth.controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockPrisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      body: {},
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
    };

    vi.clearAllMocks();
  });

  describe('loginController', () => {
    it('should return 400 for missing email', async () => {
      mockReq.body = { password: 'password123' };

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for missing password', async () => {
      mockReq.body = { email: 'test@example.com' };

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for non-string email', async () => {
      mockReq.body = { email: 123, password: 'password123' };

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for non-string password', async () => {
      mockReq.body = { email: 'test@example.com', password: 123 };

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for invalid email format', async () => {
      mockReq.body = { email: 'notanemail', password: 'password123' };

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for email too long', async () => {
      const longEmail = `${'a'.repeat(250)}@example.com`;
      mockReq.body = { email: longEmail, password: 'password123' };

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for password too long', async () => {
      const longPassword = 'a'.repeat(130);
      mockReq.body = { email: 'test@example.com', password: longPassword };

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for password too short', async () => {
      mockReq.body = { email: 'test@example.com', password: 'short' };

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 for non-existent user', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid email or password',
      });
    });

    it('should return 401 for wrong password', async () => {
      mockReq.body = { email: 'test@example.com', password: 'wrongpassword' };

      const mockUser = {
        userId: 1,
        userEmail: 'test@example.com',
        userPassword: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        userTypeId: 2,
        userType: { userTypeId: 2, userTypeName: 'Student' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.spyOn(passwordUtils, 'comparePassword').mockResolvedValue(false);

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid email or password',
      });
    });

    it('should return token and user for valid credentials', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };

      const mockUser = {
        userId: 1,
        userEmail: 'test@example.com',
        userPassword: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        userTypeId: 2,
        userType: { userTypeId: 2, userTypeName: 'Student' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.spyOn(passwordUtils, 'comparePassword').mockResolvedValue(true);
      vi.spyOn(jwtUtils, 'generateToken').mockReturnValue('mock-jwt-token');

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(jsonMock).toHaveBeenCalledWith({
        token: 'mock-jwt-token',
        user: {
          userId: 1,
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
        },
      });
    });

    it('should sanitize email (trim and lowercase)', async () => {
      mockReq.body = { email: '  Test@Example.COM  ', password: 'password123' };

      const mockUser = {
        userId: 1,
        userEmail: 'test@example.com',
        userPassword: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        userTypeId: 2,
        userType: { userTypeId: 2, userTypeName: 'Student' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.spyOn(passwordUtils, 'comparePassword').mockResolvedValue(true);
      vi.spyOn(jwtUtils, 'generateToken').mockReturnValue('mock-jwt-token');

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userEmail: 'test@example.com' },
        include: { userType: true },
      });
    });

    it('should return 500 for database error', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await loginController(
        mockReq as Request,
        mockRes as Response,
        mockPrisma,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('logoutController', () => {
    it('should return success message', () => {
      logoutController(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });
});
