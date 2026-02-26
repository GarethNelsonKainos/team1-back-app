import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { comparePasswordMock, findUniqueMock } = vi.hoisted(() => ({
  comparePasswordMock: vi.fn(),
  findUniqueMock: vi.fn(),
}));

vi.mock('../../src/services/s3.service.js', () => ({
  S3Service: vi.fn().mockImplementation(() => ({ uploadFile: vi.fn() })),
}));

vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
    },
  } as unknown as Partial<PrismaClient>,
}));

vi.mock('../../src/utils/password.utils.js', () => ({
  comparePassword: comparePasswordMock,
}));

let app: Express;

beforeAll(async () => {
  const appModule = await import('../../src/index.js');
  app = appModule.default;
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST /api/auth/login (integration)', () => {
  it('returns 400 when payload is invalid', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'short',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid credentials' });
  });

  it('returns 401 when credentials are invalid', async () => {
    findUniqueMock.mockResolvedValue({
      userId: 1,
      userEmail: 'test@example.com',
      userPassword: 'hashed-password',
      userTypeId: 1,
      firstName: 'Test',
      lastName: 'User',
      userType: { userTypeId: 1, typeName: 'Applicant' },
    });
    comparePasswordMock.mockResolvedValue(false);

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'GoodPassword123',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid credentials' });
  });

  it('returns 200 and token when credentials are valid', async () => {
    findUniqueMock.mockResolvedValue({
      userId: 1,
      userEmail: 'test@example.com',
      userPassword: 'hashed-password',
      userTypeId: 1,
      firstName: 'Test',
      lastName: 'User',
      userType: { userTypeId: 1, typeName: 'Applicant' },
    });
    comparePasswordMock.mockResolvedValue(true);

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'GoodPassword123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });
});
