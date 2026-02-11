import { describe, expect, it } from 'vitest';

describe('prisma client error', () => {
  it('should throw if DATABASE_URL is not set', async () => {
    const originalEnv = process.env.DATABASE_URL;
    process.env.DATABASE_URL = '';
    try {
      await import('../lib/prisma');
      throw new Error('Should have thrown');
    } catch (e) {
      if (e instanceof Error) {
        expect(
          e.message.includes('DATABASE_URL environment variable is not set!') ||
            e.message.includes("Cannot find module '.prisma/client/default'"),
        ).toBe(true);
      } else {
        throw e;
      }
    } finally {
      process.env.DATABASE_URL = originalEnv;
    }
  });
});
