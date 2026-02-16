// test/jwt.utils.test.ts

import { beforeEach, describe, expect, it } from 'vitest';
import {
  extractTokenFromHeader,
  generateToken,
  verifyToken,
} from '../src/utils/jwt.utils';

describe('jwt.utils', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  it('generateToken returns a token', () => {
    const token = generateToken({
      userId: 1,
      email: 'test@example.com',
      userRole: 2,
      firstName: 'Test',
      lastName: 'User',
    });
    expect(token).toBeTypeOf('string');
    expect(token.length).toBeGreaterThan(10);
  });

  it('verifyToken returns payload for valid token', () => {
    const token = generateToken({
      userId: 1,
      email: 'test@example.com',
      userRole: 2,
      firstName: 'Test',
      lastName: 'User',
    });
    const payload = verifyToken(token);
    expect(payload?.userId).toBe(1);
    expect(payload?.email).toBe('test@example.com');
    expect(payload?.firstName).toBe('Test');
    expect(payload?.lastName).toBe('User');
  });

  it('verifyToken returns null for invalid token', () => {
    const payload = verifyToken('invalid.token.here');
    expect(payload).toBeNull();
  });

  it('extractTokenFromHeader returns token', () => {
    const token = extractTokenFromHeader('Bearer abc123');
    expect(token).toBe('abc123');
  });

  it('extractTokenFromHeader returns null for missing header', () => {
    const token = extractTokenFromHeader(undefined);
    expect(token).toBeNull();
  });
});
