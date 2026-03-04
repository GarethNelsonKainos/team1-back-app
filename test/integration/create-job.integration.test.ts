import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../src/types/auth.types.js';
import { generateToken } from '../../src/utils/jwt.utils.js';

const { mockPrisma, txMock } = vi.hoisted(() => {
  const createdJobRole = {
    jobRoleId: 1,
    roleName: 'Integration Test Software Engineer',
    capabilityId: 1,
    bandId: 3,
    description: 'Integration test job role description.',
    responsibilities: 'Integration test responsibilities for the role.',
    jobSpecLink:
      'https://kainossoftwareltd.sharepoint.com/sites/hr/job-specs/integration-test',
    openPositions: 1,
    closingDate: new Date('2027-12-31T23:59:59.000Z'),
    jobRoleStatusId: 1,
  };

  const txMock = {
    jobRole: { create: vi.fn().mockResolvedValue(createdJobRole) },
    jobRoleLocation: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
  };

  const mockPrisma = {
    jobRole: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    jobRoleLocation: { deleteMany: vi.fn() },
    jobRoleStatus: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ jobRoleStatusId: 1, statusName: 'Open' }),
    },
    capability: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ capabilityId: 1, capabilityName: 'Engineering' }),
    },
    band: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ bandId: 3, bandName: 'Associate' }),
    },
    location: {
      findMany: vi
        .fn()
        .mockResolvedValue([{ locationId: 1, locationName: 'Belfast' }]),
    },
    $transaction: vi.fn().mockImplementation((fn) => fn(txMock)),
  };
  return { mockPrisma, txMock };
});

vi.mock('../../src/db/prisma.js', () => ({
  prisma: mockPrisma,
}));

vi.mock('../../src/services/s3.service.js', () => ({
  S3Service: vi.fn().mockImplementation(() => ({ uploadFile: vi.fn() })),
}));

let app: Express;

const adminToken = generateToken({
  userId: 1,
  email: 'admin@kainos.com',
  userRole: UserRole.Admin,
  firstName: 'Admin',
  lastName: 'User',
});

const applicantToken = generateToken({
  userId: 10,
  email: 'applicant@example.com',
  userRole: UserRole.Applicant,
  firstName: 'Regular',
  lastName: 'User',
});

const validJobRoleData = {
  roleName: 'Integration Test Software Engineer',
  capabilityId: 1,
  bandId: 3,
  description: 'Integration test job role description.',
  responsibilities: 'Integration test responsibilities for the role.',
  jobSpecLink:
    'https://kainossoftwareltd.sharepoint.com/sites/hr/job-specs/integration-test',
  openPositions: 1,
  locationIds: [1],
  closingDate: '2027-12-31T23:59:59.000Z',
};

beforeAll(async () => {
  process.env.ENABLE_ADD_JOB_ROLE = 'true';
  vi.resetModules();
  const appModule = await import('../../src/index.js');
  app = appModule.default;
});

afterAll(() => {
  vi.resetAllMocks();
});

describe('POST /api/job-roles', () => {
  it('should create a job role successfully when admin provides valid data', async () => {
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
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    expect(txMock.jobRole.create).toHaveBeenCalledOnce();
    expect(txMock.jobRoleLocation.createMany).toHaveBeenCalledOnce();
  });

  it('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .send(validJobRoleData);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No token provided');
  });

  it('should return 401 when an invalid token is provided', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', 'Bearer invalid-token-xyz')
      .send(validJobRoleData);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid or expired token');
  });

  it('should return 403 when a non-admin user tries to create a job role', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${applicantToken}`)
      .send(validJobRoleData);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when required fields are missing', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ roleName: 'Integration Test Incomplete' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when roleName is too short', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validJobRoleData, roleName: 'AB' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain(
      'Role name must be at least 3 characters',
    );
  });

  it('should return 400 when jobSpecLink is not a Kainos SharePoint URL', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validJobRoleData, jobSpecLink: 'https://google.com/doc' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Kainos SharePoint');
  });

  it('should return 400 when locationIds is empty', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validJobRoleData, locationIds: [] });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('At least one location required');
  });

  it('should return 400 when closingDate is in the past', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validJobRoleData, closingDate: '2020-01-01T00:00:00.000Z' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when capabilityId does not exist', async () => {
    mockPrisma.capability.findUnique.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validJobRoleData, capabilityId: 999999 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when bandId does not exist', async () => {
    mockPrisma.band.findUnique.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validJobRoleData, bandId: 999999 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
