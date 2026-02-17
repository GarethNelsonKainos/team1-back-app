import { describe, expect, it } from 'vitest';
import { formatLoginResponse } from '../../src/validator/LoginValidator.js';

describe('LoginMapper', () => {
  describe('formatLoginResponse', () => {
    it('should return token from login result', () => {
      const result = formatLoginResponse({ token: 'mock-jwt-token' });
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should return LoginResult with only token', () => {
      const input = { token: 'test-token-123' };
      const output = formatLoginResponse(input);
      expect(Object.keys(output)).toEqual(['token']);
      expect(output).toStrictEqual({ token: 'test-token-123' });
    });
  });
});
