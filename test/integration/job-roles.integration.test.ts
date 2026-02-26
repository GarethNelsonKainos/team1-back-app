import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { UserRole } from '../../src/types/auth.types.js';
import { generateToken } from '../../src/utils/jwt.utils.js';

let app: Express;
let prisma: PrismaClient;

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
  closingDate: '2026-12-31T23:59:59.000Z',
};

beforeAll(async () => {
  process.env.ENABLE_ADD_JOB_ROLE = 'true';
  const appModule = await import('../../src/index.js');
  app = appModule.default;

  const { prisma: prismaInstance } = await import('../../src/db/prisma.js');
  prisma = prismaInstance;
});

beforeEach(async () => {
  await prisma.jobRoleLocation.deleteMany({
    where: { jobRole: { roleName: { contains: 'Integration Test' } } },
  });
  await prisma.jobRole.deleteMany({
    where: { roleName: { contains: 'Integration Test' } },
  });
});

afterAll(async () => {
  await prisma.jobRoleLocation.deleteMany({
    where: { jobRole: { roleName: { contains: 'Integration Test' } } },
  });
  await prisma.jobRole.deleteMany({
    where: { roleName: { contains: 'Integration Test' } },
  });
  await prisma.$disconnect();
});

describe('POST /api/job-roles', () => {
  it('should create a job role successfully when admin provides valid data', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validJobRoleData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('jobRoleId');

    const created = await prisma.jobRole.findFirst({
      where: { roleName: validJobRoleData.roleName },
      include: { locations: true },
    });

    expect(created).not.toBeNull();
    expect(created?.roleName).toBe(validJobRoleData.roleName);
    expect(created?.bandId).toBe(validJobRoleData.bandId);
    expect(created?.capabilityId).toBe(validJobRoleData.capabilityId);
    expect(created?.locations).toHaveLength(
      validJobRoleData.locationIds.length,
    );
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
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when jobSpecLink is not a Kainos SharePoint URL', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validJobRoleData, jobSpecLink: 'https://google.com/doc' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when locationIds is empty', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validJobRoleData, locationIds: [] });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
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
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validJobRoleData, capabilityId: 999999 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when bandId does not exist', async () => {
    const response = await request(app)
      .post('/api/job-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validJobRoleData, bandId: 999999 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
