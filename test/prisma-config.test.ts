import { afterEach, describe, expect, it, vi } from 'vitest';

describe('Prisma Module Configuration', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('should successfully initialize when DATABASE_URL is set', async () => {
    const prismaModule = await import('../src/db/prisma.js');
    expect(prismaModule.prisma).toBeDefined();
  });
});
