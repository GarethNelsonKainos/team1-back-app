import { describe, expect, it } from 'vitest';
import { validateLoginRequest } from '../../src/validators/login.validator.js';

describe('LoginValidator', () => {
  describe('validateLoginRequest', () => {
    it('should return error for missing body', () => {
      const result = validateLoginRequest(null);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should return error for non-object body', () => {
      const result = validateLoginRequest('string');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should return error for missing email', () => {
      const result = validateLoginRequest({ password: 'password123' });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should return error for missing password', () => {
      const result = validateLoginRequest({ email: 'test@example.com' });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should return error for non-string email', () => {
      const result = validateLoginRequest({
        email: 123,
        password: 'password123',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should return error for non-string password', () => {
      const result = validateLoginRequest({
        email: 'test@example.com',
        password: 123,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should return error for invalid email format', () => {
      const result = validateLoginRequest({
        email: 'notanemail',
        password: 'password123',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should return error for email too long', () => {
      const longEmail = `${'a'.repeat(250)}@example.com`;
      const result = validateLoginRequest({
        email: longEmail,
        password: 'password123',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should return error for password too long', () => {
      const result = validateLoginRequest({
        email: 'test@example.com',
        password: 'a'.repeat(130),
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should return error for password too short', () => {
      const result = validateLoginRequest({
        email: 'test@example.com',
        password: 'short',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should return sanitized credentials for valid input', () => {
      const result = validateLoginRequest({
        email: '  Test@Example.COM  ',
        password: 'password123',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.credentials.email).toBe('test@example.com');
        expect(result.credentials.password).toBe('password123');
      }
    });

    it('should trim and lowercase email', () => {
      const result = validateLoginRequest({
        email: '  UPPERCASE@EXAMPLE.COM  ',
        password: 'password123',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.credentials.email).toBe('uppercase@example.com');
      }
    });
  });
});
