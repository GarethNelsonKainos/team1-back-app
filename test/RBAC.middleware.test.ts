// test/RBAC.middleware.test.ts

import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  requireAdmin,
  requireApplicantOrAdmin,
  requireRole,
} from '../src/middleware/RBAC.middleware';
import type { JWTPayload } from '../src/types/auth.types';

describe('RBAC.middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('requireRole', () => {
    it('should call next() when user has allowed role', () => {
      const applicantUser: JWTPayload = {
        userId: 1,
        email: 'applicant@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'Applicant',
      };

      mockRequest.user = applicantUser;

      const middleware = requireRole([1, 2]);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have allowed role', () => {
      const applicantUser: JWTPayload = {
        userId: 1,
        email: 'applicant@example.com',
        userTypeId: 1,
        firstName: 'Test',
        lastName: 'Applicant',
      };

      mockRequest.user = applicantUser;

      const middleware = requireRole([2]);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access denied. Insufficient permissions.',
      });
    });

    it('should return 401 when user is not authenticated', () => {
      mockRequest.user = undefined;

      const middleware = requireRole([1, 2]);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });

    it('should allow multiple role types', () => {
      const adminUser: JWTPayload = {
        userId: 2,
        email: 'admin@example.com',
        userTypeId: 2,
        firstName: 'Test',
        lastName: 'Admin',
      };

      mockRequest.user = adminUser;

      const middleware = requireRole([1, 2, 3]);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin user (userTypeId = 2)', () => {
      const adminUser: JWTPayload = {
        userId: 2,
        email: 'admin@example.com',
        userTypeId: 2,
        firstName: 'Admin',
        lastName: 'User',
      };

      mockRequest.user = adminUser;

      const middleware = requireAdmin();
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject applicant user (userTypeId = 1)', () => {
      const applicantUser: JWTPayload = {
        userId: 1,
        email: 'applicant@example.com',
        userTypeId: 1,
        firstName: 'Applicant',
        lastName: 'User',
      };

      mockRequest.user = applicantUser;

      const middleware = requireAdmin();
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access denied. Insufficient permissions.',
      });
    });

    it('should reject unauthenticated user', () => {
      mockRequest.user = undefined;

      const middleware = requireAdmin();
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });
  });

  describe('requireApplicantOrAdmin', () => {
    it('should allow applicant user (userTypeId = 1)', () => {
      const applicantUser: JWTPayload = {
        userId: 1,
        email: 'applicant@example.com',
        userTypeId: 1,
        firstName: 'Applicant',
        lastName: 'User',
      };

      mockRequest.user = applicantUser;

      const middleware = requireApplicantOrAdmin();
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow admin user (userTypeId = 2)', () => {
      const adminUser: JWTPayload = {
        userId: 2,
        email: 'admin@example.com',
        userTypeId: 2,
        firstName: 'Admin',
        lastName: 'User',
      };

      mockRequest.user = adminUser;

      const middleware = requireApplicantOrAdmin();
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject user with different role', () => {
      const otherUser: JWTPayload = {
        userId: 3,
        email: 'other@example.com',
        userTypeId: 3,
        firstName: 'Other',
        lastName: 'User',
      };

      mockRequest.user = otherUser;

      const middleware = requireApplicantOrAdmin();
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access denied. Insufficient permissions.',
      });
    });

    it('should reject unauthenticated user', () => {
      mockRequest.user = undefined;

      const middleware = requireApplicantOrAdmin();
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });
  });
});
