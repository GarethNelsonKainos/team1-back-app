// test/auth.middleware.test.ts

import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authMiddleware,
  requireAdmin,
  requireApplicantOrAdmin,
  requireRole,
} from '../src/middleware/auth.middleware';
import { UserRole } from '../src/types/auth.types.js';
import { generateToken } from '../src/utils/jwt.utils';

describe('auth.middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    vi.clearAllMocks();
  });

  it('should call next() with valid token', () => {
    const token = generateToken({
      userId: 1,
      email: 'test@example.com',
      userRole: 2,
      firstName: 'Test',
      lastName: 'User',
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;

    const res = {} as Response;
    const next = vi.fn();

    const middleware = authMiddleware();
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user?.userId).toBe(1);
    expect(req.user?.email).toBe('test@example.com');
  });

  it('should return 401 for missing authorization header', () => {
    const req = {
      headers: {},
    } as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const next = vi.fn();

    const middleware = authMiddleware();
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token format (no Bearer prefix)', () => {
    const req = {
      headers: { authorization: 'just-a-token' },
    } as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const next = vi.fn();

    const middleware = authMiddleware();
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token', () => {
    const req = {
      headers: { authorization: 'Bearer invalid.token.here' },
    } as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const next = vi.fn();

    const middleware = authMiddleware();
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for expired token', () => {
    // Use a short-lived token for testing
    process.env.JWT_EXPIRES_IN = '0s';

    const token = generateToken({
      userId: 1,
      email: 'test@example.com',
      userRole: 2,
      firstName: 'Test',
      lastName: 'User',
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const next = vi.fn();

    // Wait a moment for token to expire
    setTimeout(() => {
      const middleware = authMiddleware();
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    }, 100);
  });

  describe('requireRole', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: ReturnType<typeof vi.fn>;
    let statusMock: ReturnType<typeof vi.fn>;
    let jsonMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      jsonMock = vi.fn().mockReturnValue({});
      statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      mockNext = vi.fn();

      mockReq = {
        headers: {},
        user: {
          userId: 1,
          email: 'test@example.com',
          userRole: UserRole.Applicant,
          firstName: 'Test',
          lastName: 'User',
        },
      };

      mockRes = {
        status: statusMock,
        json: jsonMock,
      } as unknown as Response;
    });

    it('should return 401 if user not authenticated', () => {
      mockReq.user = undefined;
      mockReq.headers = {};

      const middleware = requireRole([UserRole.Admin]);
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'No token provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user role not in allowed roles', () => {
      const token = generateToken({
        userId: 1,
        email: 'test@example.com',
        userRole: UserRole.Applicant,
        firstName: 'Test',
        lastName: 'User',
      });
      mockReq.headers = { authorization: `Bearer ${token}` };
      const middleware = requireRole([UserRole.Admin]);
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() if user role is in allowed roles', () => {
      const token = generateToken({
        userId: 1,
        email: 'test@example.com',
        userRole: UserRole.Applicant,
        firstName: 'Test',
        lastName: 'User',
      });
      mockReq.headers = { authorization: `Bearer ${token}` };
      const middleware = requireRole([UserRole.Applicant]);
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should call next() for admin when admin role allowed', () => {
      const token = generateToken({
        userId: 1,
        email: 'test@example.com',
        userRole: UserRole.Admin,
        firstName: 'Test',
        lastName: 'User',
      });
      mockReq.headers = { authorization: `Bearer ${token}` };
      const middleware = requireRole([UserRole.Admin]);
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow multiple roles', () => {
      const token = generateToken({
        userId: 1,
        email: 'test@example.com',
        userRole: UserRole.Applicant,
        firstName: 'Test',
        lastName: 'User',
      });
      mockReq.headers = { authorization: `Bearer ${token}` };
      const middleware = requireRole([UserRole.Admin, UserRole.Applicant]);
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: ReturnType<typeof vi.fn>;
    let statusMock: ReturnType<typeof vi.fn>;
    let jsonMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      jsonMock = vi.fn().mockReturnValue({});
      statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      mockNext = vi.fn();

      mockReq = {
        headers: {},
        user: {
          userId: 1,
          email: 'test@example.com',
          userRole: UserRole.Applicant,
          firstName: 'Test',
          lastName: 'User',
        },
      };

      mockRes = {
        status: statusMock,
        json: jsonMock,
      } as unknown as Response;
    });

    it('should return 403 if user is applicant', () => {
      const token = generateToken({
        userId: 1,
        email: 'test@example.com',
        userRole: UserRole.Applicant,
        firstName: 'Test',
        lastName: 'User',
      });
      mockReq.headers = { authorization: `Bearer ${token}` };
      const middleware = requireAdmin();
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() if user is admin', () => {
      const token = generateToken({
        userId: 1,
        email: 'test@example.com',
        userRole: UserRole.Admin,
        firstName: 'Test',
        lastName: 'User',
      });
      mockReq.headers = { authorization: `Bearer ${token}` };
      const middleware = requireAdmin();
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if user not authenticated', () => {
      mockReq.user = undefined;
      mockReq.headers = {};
      const middleware = requireAdmin();
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe('requireApplicantOrAdmin', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: ReturnType<typeof vi.fn>;
    let statusMock: ReturnType<typeof vi.fn>;
    let jsonMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      jsonMock = vi.fn().mockReturnValue({});
      statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      mockNext = vi.fn();

      mockReq = {
        headers: {},
        user: {
          userId: 1,
          email: 'test@example.com',
          userRole: UserRole.Applicant,
          firstName: 'Test',
          lastName: 'User',
        },
      };

      mockRes = {
        status: statusMock,
        json: jsonMock,
      } as unknown as Response;
    });

    it('should allow applicant', () => {
      const token = generateToken({
        userId: 1,
        email: 'test@example.com',
        userRole: UserRole.Applicant,
        firstName: 'Test',
        lastName: 'User',
      });
      mockReq.headers = { authorization: `Bearer ${token}` };
      const middleware = requireApplicantOrAdmin();
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow admin', () => {
      const token = generateToken({
        userId: 1,
        email: 'test@example.com',
        userRole: UserRole.Admin,
        firstName: 'Test',
        lastName: 'User',
      });
      mockReq.headers = { authorization: `Bearer ${token}` };
      const middleware = requireApplicantOrAdmin();
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if user not authenticated', () => {
      mockReq.user = undefined;
      mockReq.headers = {};
      const middleware = requireApplicantOrAdmin();
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });
});
