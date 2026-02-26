vi.mock('../../src/services/s3.service.js', () => ({
  S3Service: vi.fn().mockImplementation(() => ({ uploadFile: vi.fn() })),
}));

vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type MockUser = {
  userId: number;
  firstName: string;
  lastName: string;
  userEmail: string;
  userPassword: string;
  userTypeId: number;
  userType: { userTypeId: number; userTypeDesc: string };
};
import { prisma } from '../../src/db/prisma.js';
import app from '../../src/index.js';
import { verifyToken } from '../../src/utils/jwt.utils.js';
import { hashPassword } from '../../src/utils/password.utils.js';

let hashedPassword: string;

const PLAIN_PASSWORD = 'ValidPass1';

beforeAll(async () => {
  hashedPassword = await hashPassword(PLAIN_PASSWORD);
});

const applicantFixture = () => ({
  userId: 1,
  firstName: 'Alice',
  lastName: 'Applicant',
  userEmail: 'alice@example.com',
  userPassword: hashedPassword,
  userTypeId: 1,
  userType: { userTypeId: 1, userTypeDesc: 'Applicant' },
});

const adminFixture = () => ({
  userId: 2,
  firstName: 'Charlie',
  lastName: 'Admin',
  userEmail: 'charlie@example.com',
  userPassword: hashedPassword,
  userTypeId: 2,
  userType: { userTypeId: 2, userTypeDesc: 'Admin' },
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
  });

  describe('Happy path', () => {
    it('should return 200 and a JWT token for a valid applicant login', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        applicantFixture() as unknown as MockUser,
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: PLAIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(typeof response.body.token).toBe('string');

      const payload = verifyToken(response.body.token);
      expect(payload).not.toBeNull();
      expect(payload?.email).toBe('alice@example.com');
      expect(payload?.firstName).toBe('Alice');
      expect(payload?.lastName).toBe('Applicant');
      expect(payload?.userRole).toBe(1);
    });
    it('should return 200 and a JWT token for a valid admin login', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        adminFixture() as unknown as MockUser,
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'charlie@example.com', password: PLAIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(typeof response.body.token).toBe('string');

      const payload = verifyToken(response.body.token);
      expect(payload).not.toBeNull();
      expect(payload?.email).toBe('charlie@example.com');
      expect(payload?.firstName).toBe('Charlie');
      expect(payload?.lastName).toBe('Admin');
      expect(payload?.userRole).toBe(2);
    });
  });

  describe('Authentication failures', () => {
    it('should return 401 when password has leading/trailing whitespace', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        applicantFixture() as unknown as MockUser,
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@example.com',
          password: `  ${PLAIN_PASSWORD}  `,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 401 when password is typed in uppercase', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        applicantFixture() as unknown as MockUser,
      );

      const response = await request(app).post('/api/auth/login').send({
        email: 'alice@example.com',
        password: PLAIN_PASSWORD.toUpperCase(),
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });
    it('should return 401 when user is not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: PLAIN_PASSWORD });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 401 when password is incorrect', async () => {
      const wrongHash = await hashPassword('DifferentPass1');
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...applicantFixture(),
        userPassword: wrongHash,
      } as unknown as MockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: PLAIN_PASSWORD });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 500 when the database throws an unexpected error', async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB down'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: PLAIN_PASSWORD });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Validation failures', () => {
    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: PLAIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 400 when email is malformed', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notanemail', password: PLAIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 400 when password is shorter than 8 characters', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: 'short' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 400 when email has leading/trailing whitespace', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: '  alice@example.com  ', password: PLAIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 400 when body is empty', async () => {
      const response = await request(app).post('/api/auth/login').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 400 when email exceeds 255 characters', async () => {
      const longEmail = `${'a'.repeat(247)}@test.com`;

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: longEmail, password: PLAIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 400 when password exceeds 128 characters', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: 'a'.repeat(129) });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });
  });
  describe('Response shape', () => {
    it('should return a body with only the token field on success', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        applicantFixture() as unknown as MockUser,
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: PLAIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(Object.keys(response.body)).toEqual(['token']);
    });
  });
});
