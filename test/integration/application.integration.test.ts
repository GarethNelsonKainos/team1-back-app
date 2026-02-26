import express from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ApplicationController } from '../../src/controllers/ApplicationController.js';
import { prisma } from '../../src/db/prisma.js';
import applicationRoutes from '../../src/routes/application.routes.js';
import { ApplicationService } from '../../src/services/application.service.js';
import { S3Service } from '../../src/services/s3.service.js';
import { UserRole } from '../../src/types/auth.types.js';

vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    jobRole: { findUnique: vi.fn() },
    application: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

// Bypass JWT verification — auth middleware is tested separately
vi.mock('../../src/middleware/auth.middleware.js', () => ({
  authMiddleware:
    () =>
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      req.user = {
        userId: TEST_USER_ID,
        userRole: UserRole.Applicant,
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Example',
      };
      next();
    },
}));

// Bypass real S3 uploads — we only care about the HTTP response
vi.mock('../../src/services/s3.service.js', () => ({
  S3Service: vi.fn().mockImplementation(() => ({
    uploadFile: vi.fn().mockResolvedValue('https://s3.example.com/test-cv.pdf'),
  })),
}));

const TEST_USER_ID = 1;
const VALID_JOB_ROLE_ID = 1;
const NONEXISTENT_JOB_ROLE_ID = 99999;

const MOCK_OPEN_JOB_ROLE = {
  jobRoleId: VALID_JOB_ROLE_ID,
  status: { statusName: 'Open' },
};

const MOCK_APPLICATION = {
  applicationId: 1,
  userId: TEST_USER_ID,
  jobRoleId: VALID_JOB_ROLE_ID,
  applicationStatusId: 1,
  cvUrl: 'https://s3.example.com/test-cv.pdf',
  createdAt: new Date(),
};

const app = express();
app.use(express.json());
app.use(
  '/api/applications',
  applicationRoutes(
    new ApplicationController(new ApplicationService(prisma, new S3Service())),
  ),
);

const MOCK_PDF = Buffer.from('%PDF-1.4 1 0 obj<</Type/Catalog>>endobj');

describe('POST /api/applications', () => {
  beforeAll(() => {
    process.env.ENABLE_JOB_APPLICATIONS = 'true';
  });

  it('should return 201 when a valid application is submitted', async () => {
    vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(
      MOCK_OPEN_JOB_ROLE as never,
    );
    vi.mocked(prisma.application.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.application.create).mockResolvedValue(
      MOCK_APPLICATION as never,
    );

    const response = await request(app)
      .post('/api/applications')
      .attach('cv', MOCK_PDF, {
        filename: 'test-cv.pdf',
        contentType: 'application/pdf',
      })
      .field('jobRoleId', String(VALID_JOB_ROLE_ID));

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Application submitted successfully');
  });

  it('should return 400 when no CV file is provided', async () => {
    const response = await request(app)
      .post('/api/applications')
      .send({ jobRoleId: VALID_JOB_ROLE_ID });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('CV file is required');
  });

  it('should return 400 when the job role ID is not a valid number', async () => {
    const response = await request(app)
      .post('/api/applications')
      .attach('cv', MOCK_PDF, {
        filename: 'test-cv.pdf',
        contentType: 'application/pdf',
      })
      .field('jobRoleId', 'not-a-number');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid job role ID');
  });

  it('should return 400 when applying for a non-existent job role', async () => {
    vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(null);

    const response = await request(app)
      .post('/api/applications')
      .attach('cv', MOCK_PDF, {
        filename: 'test-cv.pdf',
        contentType: 'application/pdf',
      })
      .field('jobRoleId', String(NONEXISTENT_JOB_ROLE_ID));

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'Unable to apply. Role may not be open or you may have already applied.',
    );
  });
});
