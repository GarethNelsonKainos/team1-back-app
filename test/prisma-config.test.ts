import { describe, expect, it } from 'vitest';
import { prisma } from '../lib/prisma';

describe('prisma client', () => {
  it('should connect and query the database', async () => {
    const users = await prisma.user.findMany();
    expect(Array.isArray(users)).toBe(true);
  });
});
