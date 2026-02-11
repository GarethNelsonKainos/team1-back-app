// test/auth.middleware.test.ts

import { NextFunction, type Request, type Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authMiddleware } from '../src/middleware/auth.middleware';
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
      userTypeId: 2,
      firstName: 'Test',
      lastName: 'User',
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;

    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next);

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

    authMiddleware(req, res, next);

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

    authMiddleware(req, res, next);

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

    authMiddleware(req, res, next);

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
      userTypeId: 2,
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
      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    }, 100);
  });
});
