import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { UserRole } from '../../src/types/auth.types.js';
import { generateToken } from '../../src/utils/jwt.utils.js';

let app: Express;
let prisma: PrismaClient;

const validJobRoleData = {
  roleName: 'Senior Software Engineer',
  capabilityId: 1,
  bandId: 3,
  description: 'Looking for an experienced software engineer to join our team.',
  responsibilities:
    'Design and develop scalable applications, mentor junior developers, participate in code reviews.',
  jobSpecLink:
    'https://kainossoftwareltd.sharepoint.com/sites/hr/job-specs/senior-engineer',
  openPositions: 2,
  locationIds: [1, 2],
  closingDate: '2026-03-31T23:59:59.000Z',
};

beforeAll(async () => {
  process.env.ENABLE_ADD_JOB_ROLE = 'true';
  const appModule = await import('../../src/index.js');
  app = appModule.default;

  // Access the real Prisma instance for cleanup
  const { prisma: prismaInstance } = await import('../../src/db/prisma.js');
  prisma = prismaInstance;
});

beforeEach(async () => {
  // Clean up test data before each test
  await prisma.jobRoleLocation.deleteMany({
    where: {
      jobRole: {
        roleName: { contains: 'Senior Software Engineer' },
      },
    },
  });

  await prisma.jobRole.deleteMany({
    where: {
      roleName: { contains: 'Senior Software Engineer' },
    },
  });
});

afterAll(async () => {
  // Final cleanup
  await prisma.jobRoleLocation.deleteMany({
    where: {
      jobRole: {
        roleName: { contains: 'Senior Software Engineer' },
      },
    },
  });

  await prisma.jobRole.deleteMany({
    where: {
      roleName: { contains: 'Senior Software Engineer' },
    },
  });

  await prisma.$disconnect();
});

describe('POST /api/job-roles', () => {
  it('should create job role when admin user provides valid data', async () => {
    const adminToken = generateToken({
      userId: 1,
      email: 'admin@kainos.com',
      userRole: UserRole.Admin,
      firstName: 'Admin',
      lastName: 'User',
    });

    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validJobRoleData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('jobRoleId');
    expect(response.body).toHaveProperty(
      'message',
      'Job role created successfully',
    );

    // Verify the job role was actually created in the database
    const createdJobRole = await prisma.jobRole.findFirst({
      where: { roleName: validJobRoleData.roleName },
      include: { locations: true },
    });

    expect(createdJobRole).toBeDefined();
    expect(createdJobRole?.roleName).toBe(validJobRoleData.roleName);
    expect(createdJobRole?.capabilityId).toBe(validJobRoleData.capabilityId);
    expect(createdJobRole?.bandId).toBe(validJobRoleData.bandId);
    expect(createdJobRole?.locations).toHaveLength(
      validJobRoleData.locationIds.length,
    );
  });

  it('should return 403 when non-admin user tries to create job role', async () => {
    const applicantToken = generateToken({
      userId: 10,
      email: 'applicant@example.com',
      userRole: UserRole.Applicant,
      firstName: 'Regular',
      lastName: 'User',
    });

    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${applicantToken}`)
      .send(validJobRoleData);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Insufficient permissions');
  });

  it('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .send(validJobRoleData);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No token provided');
  });

  it('should return 401 when invalid token is provided', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', 'Bearer invalid-token-xyz')
      .send(validJobRoleData);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid or expired token');
  });

  it('should return 400 when roleName is too short', async () => {
    const adminToken = generateToken({
      userId: 1,
      email: 'admin@kainos.com',
      userRole: UserRole.Admin,
      firstName: 'Admin',
      lastName: 'User',
    });

    const invalidData = { ...validJobRoleData, roleName: 'AB' };

    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain(
      'Role name must be at least 3 characters',
    );
  });

  it('should return 400 when jobSpecLink is not a Kainos SharePoint URL', async () => {
    const adminToken = generateToken({
      userId: 1,
      email: 'admin@kainos.com',
      userRole: UserRole.Admin,
      firstName: 'Admin',
      lastName: 'User',
    });

    const invalidData = {
      ...validJobRoleData,
      jobSpecLink: 'https://google.com/doc',
    };

    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Kainos SharePoint');
  });

  it('should return 400 when locationIds is empty', async () => {
    const adminToken = generateToken({
      userId: 1,
      email: 'admin@kainos.com',
      userRole: UserRole.Admin,
      firstName: 'Admin',
      lastName: 'User',
    });

    const invalidData = { ...validJobRoleData, locationIds: [] };

    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('At least one location required');
  });

  it('should return 400 when required fields are missing', async () => {
    const adminToken = generateToken({
      userId: 1,
      email: 'admin@kainos.com',
      userRole: UserRole.Admin,
      firstName: 'Admin',
      lastName: 'User',
    });

    const incompleteData = { roleName: 'Engineer' };

    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(incompleteData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when capabilityId does not exist', async () => {
    const adminToken = generateToken({
      userId: 1,
      email: 'admin@kainos.com',
      userRole: UserRole.Admin,
      firstName: 'Admin',
      lastName: 'User',
    });

    const invalidData = { ...validJobRoleData, capabilityId: 999999 };

    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when bandId does not exist', async () => {
    const adminToken = generateToken({
      userId: 1,
      email: 'admin@kainos.com',
      userRole: UserRole.Admin,
      firstName: 'Admin',
      lastName: 'User',
    });

    const invalidData = { ...validJobRoleData, bandId: 999999 };

    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

describe('POST /api/job-roles - Feature Flag Disabled', () => {
  let appDisabled: Express;

  beforeAll(async () => {
    process.env.ENABLE_ADD_JOB_ROLE = 'false';
    vi.resetModules();
    const appModule = await import('../../src/index.js');
    appDisabled = appModule.default;
  });

  it('should return 404 when feature flag is disabled', async () => {
    const adminToken = generateToken({
      userId: 1,
      email: 'admin@kainos.com',
      userRole: UserRole.Admin,
      firstName: 'Admin',
      lastName: 'User',
    });

    const response = await request(appDisabled)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validJobRoleData);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Feature not available');
  });

  afterAll(() => {
    process.env.ENABLE_ADD_JOB_ROLE = 'true';
    vi.resetModules();
  });
});
