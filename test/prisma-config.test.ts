import { afterEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../lib/prisma';

describe('Prisma Module Configuration', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('should successfully initialize when DATABASE_URL is set', async () => {
    const prismaModule = await import('../src/db/prisma.js');
    expect(prismaModule.prisma).toBeDefined();
  });

  it('should connect and query the database', async () => {
    const users = await prisma.user.findMany();
    expect(Array.isArray(users)).toBe(true);
  });
});
