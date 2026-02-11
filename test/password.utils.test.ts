// test/password.utils.test.ts (hypothetical example)

import { describe, expect, it } from 'vitest';
import { comparePassword, hashPassword } from '../src/utils/password.utils';

describe('password.utils', () => {
  it('hashPassword returns a hash that is not the plain text', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);

    expect(hash).toBeTypeOf('string');
    expect(hash).not.toEqual(password);
    expect(hash.length).toBeGreaterThan(20);
  });

  it('comparePassword returns true for correct password', async () => {
    const password = 'CorrectHorseBatteryStaple';
    const hash = await hashPassword(password);

    const result = await comparePassword(password, hash);
    expect(result).toBe(true);
  });

  it('comparePassword returns false for incorrect password', async () => {
    const password = 'MySecretPassword';
    const hash = await hashPassword(password);

    const result = await comparePassword('WrongPassword', hash);
    expect(result).toBe(false);
  });
});
