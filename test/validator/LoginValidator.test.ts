import { describe, expect, it } from 'vitest';
import type { LoginRequest } from '../../src/types/auth.types';
import { validateLoginRequest } from '../../src/validator/LoginValidator';

describe('validateLoginRequest', () => {
  it('returns true for valid login request', () => {
    const validRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'Password123!',
    };
    expect(validateLoginRequest(validRequest)).toBe(true);
  });

  it('returns false if email is undefined', () => {
    const req: LoginRequest = {
      email: undefined,
      password: 'Password123!',
    };
    expect(validateLoginRequest(req)).toBe(false);
  });

  it('returns false if password is undefined', () => {
    const req: LoginRequest = {
      email: 'test@example.com',
      password: undefined,
    };
    expect(validateLoginRequest(req)).toBe(false);
  });

  it('returns false if email is invalid format', () => {
    const req: LoginRequest = {
      email: 'invalid-email',
      password: 'Password123!',
    };
    expect(validateLoginRequest(req)).toBe(false);
  });

  it('returns false if password is less than 8 characters', () => {
    const req: LoginRequest = {
      email: 'test@example.com',
      password: 'Pass1!',
    };
    expect(validateLoginRequest(req)).toBe(false);
  });

  it('returns false if email exceeds 255 characters', () => {
    const req: LoginRequest = {
      email: `${'a'.repeat(250)}@test.com`,
      password: 'Password123!',
    };
    expect(validateLoginRequest(req)).toBe(false);
  });

  it('returns false if password exceeds 128 characters', () => {
    const req: LoginRequest = {
      email: 'test@example.com',
      password: 'P'.repeat(129),
    };
    expect(validateLoginRequest(req)).toBe(false);
  });
});
