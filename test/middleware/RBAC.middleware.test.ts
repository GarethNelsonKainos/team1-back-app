import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  requireAdmin,
  requireApplicantOrAdmin,
  requireRole,
} from '../../src/middleware/RBAC.middleware.js';
import { UserRole } from '../../src/types/auth.types.js';

describe('RBAC.middleware', () => {
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
      user: {
        userId: 1,
        email: 'test@example.com',
        userTypeId: UserRole.Applicant,
        firstName: 'Test',
        lastName: 'User',
      },
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
  });

  describe('requireRole', () => {
    it('should return 401 if user not authenticated', () => {
      mockReq.user = undefined;

      const middleware = requireRole([UserRole.Admin]);
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'User not authenticated',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user role not in allowed roles', () => {
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
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        ...mockReq.user,
        userTypeId: UserRole.Admin,
      };
      const middleware = requireRole([UserRole.Admin]);
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow multiple roles', () => {
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        ...mockReq.user,
        userTypeId: UserRole.Applicant,
      };
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
    it('should return 403 if user is applicant', () => {
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        ...mockReq.user,
        userTypeId: UserRole.Applicant,
      };
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
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        ...mockReq.user,
        userTypeId: UserRole.Admin,
      };
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
    it('should allow applicant', () => {
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        ...mockReq.user,
        userTypeId: UserRole.Applicant,
      };
      const middleware = requireApplicantOrAdmin();
      middleware(
        mockReq as Request,
        mockRes as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow admin', () => {
      mockReq.user = {
        userId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        ...mockReq.user,
        userTypeId: UserRole.Admin,
      };
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
