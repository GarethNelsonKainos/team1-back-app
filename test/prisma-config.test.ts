import { afterEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../lib/prisma';

describe('Prisma Module Configuration', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('should successfully initialize when DATABASE_URL is set', async () => {
    const originalDatabaseUrl = process.env.DATABASE_URL;

    try {
      // Ensure DATABASE_URL is set for this test so prisma can initialize.
      process.env.DATABASE_URL =
        originalDatabaseUrl ?? 'postgresql://user:password@localhost:5432/testdb';

      const prismaModule = await import('../src/db/prisma.js');
      expect(prismaModule.prisma).toBeDefined();
    } finally {
      // Restore the original DATABASE_URL after the test.
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it('should connect and query the database', async () => {
    const users = await prisma.user.findMany();
    expect(Array.isArray(users)).toBe(true);
  });
});
