import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { buildConnectionStringFromEnv } from '../../src/utils/db-connection-generator';

const connectionString = buildConnectionStringFromEnv();

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding test database...');

  // User Types (upsert and lookup)
  const applicantType = await prisma.userType.upsert({
    where: { userTypeDesc: 'Applicant' },
    update: {},
    create: { userTypeDesc: 'Applicant' },
  });
  const adminType = await prisma.userType.upsert({
    where: { userTypeDesc: 'Admin' },
    update: {},
    create: { userTypeDesc: 'Admin' },
  });

  // Users (use looked-up IDs)
  await prisma.user.upsert({
    where: { userEmail: 'alice@example.com' },
    update: {},
    create: {
      firstName: 'Alice',
      lastName: 'Applicant',
      userEmail: 'alice@example.com',
      userPassword: 'password1',
      userTypeId: applicantType.userTypeId,
    },
  });
  await prisma.user.upsert({
    where: { userEmail: 'bob@example.com' },
    update: {},
    create: {
      firstName: 'Bob',
      lastName: 'Applicant',
      userEmail: 'bob@example.com',
      userPassword: 'password2',
      userTypeId: applicantType.userTypeId,
    },
  });
  await prisma.user.upsert({
    where: { userEmail: 'charlie@example.com' },
    update: {},
    create: {
      firstName: 'Charlie',
      lastName: 'Admin',
      userEmail: 'charlie@example.com',
      userPassword: 'adminpass',
      userTypeId: adminType.userTypeId,
    },
  });

  // Capabilities (upsert and lookup)
  const engineering = await prisma.capability.upsert({
    where: { capabilityName: 'Engineering' },
    update: {},
    create: { capabilityName: 'Engineering' },
  });
  const design = await prisma.capability.upsert({
    where: { capabilityName: 'Design' },
    update: {},
    create: { capabilityName: 'Design' },
  });
  const marketing = await prisma.capability.upsert({
    where: { capabilityName: 'Marketing' },
    update: {},
    create: { capabilityName: 'Marketing' },
  });

  // Bands (upsert and lookup)
  const bandA = await prisma.band.upsert({
    where: { bandName: 'Band A' },
    update: {},
    create: { bandName: 'Band A' },
  });
  const bandB = await prisma.band.upsert({
    where: { bandName: 'Band B' },
    update: {},
    create: { bandName: 'Band B' },
  });
  const bandC = await prisma.band.upsert({
    where: { bandName: 'Band C' },
    update: {},
    create: { bandName: 'Band C' },
  });

  // Job Role Status (upsert and lookup)
  const openStatus = await prisma.jobRoleStatus.upsert({
    where: { statusName: 'Open' },
    update: {},
    create: { statusName: 'Open' },
  });
  const closedStatus = await prisma.jobRoleStatus.upsert({
    where: { statusName: 'Closed' },
    update: {},
    create: { statusName: 'Closed' },
  });

  // Locations (upsert and lookup)
  const hq = await prisma.location.upsert({
    where: { locationName: 'HQ' },
    update: {},
    create: { locationName: 'HQ', city: 'London', country: 'UK' },
  });
  const remote = await prisma.location.upsert({
    where: { locationName: 'Remote' },
    update: {},
    create: { locationName: 'Remote', city: 'Online', country: 'Global' },
  });

  // Job Roles (upsert and lookup)
  const frontendEngineer = await prisma.jobRole.upsert({
    where: { roleName: 'Frontend Engineer' },
    update: {},
    create: {
      roleName: 'Frontend Engineer',
      capabilityId: engineering.capabilityId,
      bandId: bandA.bandId,
      closingDate: new Date(),
      jobRoleStatusId: openStatus.jobRoleStatusId,
    },
  });
  const backendEngineer = await prisma.jobRole.upsert({
    where: { roleName: 'Backend Engineer' },
    update: {},
    create: {
      roleName: 'Backend Engineer',
      capabilityId: engineering.capabilityId,
      bandId: bandB.bandId,
      closingDate: new Date(),
      jobRoleStatusId: openStatus.jobRoleStatusId,
    },
  });
  const uiDesigner = await prisma.jobRole.upsert({
    where: { roleName: 'UI Designer' },
    update: {},
    create: {
      roleName: 'UI Designer',
      capabilityId: design.capabilityId,
      bandId: bandA.bandId,
      closingDate: new Date(),
      jobRoleStatusId: openStatus.jobRoleStatusId,
    },
  });
  const uxResearcher = await prisma.jobRole.upsert({
    where: { roleName: 'UX Researcher' },
    update: {},
    create: {
      roleName: 'UX Researcher',
      capabilityId: design.capabilityId,
      bandId: bandB.bandId,
      closingDate: new Date(),
      jobRoleStatusId: openStatus.jobRoleStatusId,
    },
  });
  const marketingManager = await prisma.jobRole.upsert({
    where: { roleName: 'Marketing Manager' },
    update: {},
    create: {
      roleName: 'Marketing Manager',
      capabilityId: marketing.capabilityId,
      bandId: bandC.bandId,
      closingDate: new Date(),
      jobRoleStatusId: openStatus.jobRoleStatusId,
    },
  });
  const contentStrategist = await prisma.jobRole.upsert({
    where: { roleName: 'Content Strategist' },
    update: {},
    create: {
      roleName: 'Content Strategist',
      capabilityId: marketing.capabilityId,
      bandId: bandC.bandId,
      closingDate: new Date(),
      jobRoleStatusId: openStatus.jobRoleStatusId,
    },
  });

  // Application Status (upsert and lookup)
  const appliedStatus = await prisma.applicationStatus.upsert({
    where: { applicationStatusType: 'Applied' },
    update: {},
    create: { applicationStatusType: 'Applied' },
  });
  const interviewingStatus = await prisma.applicationStatus.upsert({
    where: { applicationStatusType: 'Interviewing' },
    update: {},
    create: { applicationStatusType: 'Interviewing' },
  });
  const hiredStatus = await prisma.applicationStatus.upsert({
    where: { applicationStatusType: 'Hired' },
    update: {},
    create: { applicationStatusType: 'Hired' },
  });
  const rejectedStatus = await prisma.applicationStatus.upsert({
    where: { applicationStatusType: 'Rejected' },
    update: {},
    create: { applicationStatusType: 'Rejected' },
  });

  // JobRoleLocation (many-to-many, use looked-up IDs)
  await prisma.jobRoleLocation.createMany({
    data: [
      { jobRoleId: frontendEngineer.jobRoleId, locationId: hq.locationId },
      { jobRoleId: backendEngineer.jobRoleId, locationId: hq.locationId },
      { jobRoleId: uiDesigner.jobRoleId, locationId: remote.locationId },
      { jobRoleId: uxResearcher.jobRoleId, locationId: remote.locationId },
      { jobRoleId: marketingManager.jobRoleId, locationId: hq.locationId },
      { jobRoleId: contentStrategist.jobRoleId, locationId: remote.locationId },
    ],
    skipDuplicates: true,
  });

  // Applications (use looked-up IDs)
  const alice = await prisma.user.findUnique({
    where: { userEmail: 'alice@example.com' },
  });
  const bob = await prisma.user.findUnique({
    where: { userEmail: 'bob@example.com' },
  });
  await prisma.application.createMany({
    data: [
      ...(alice?.userId
        ? [
            {
              userId: alice.userId,
              jobRoleId: frontendEngineer.jobRoleId,
              applicationStatusId: appliedStatus.applicationStatusId,
            },
          ]
        : []),
      ...(alice?.userId
        ? [
            {
              userId: alice.userId,
              jobRoleId: backendEngineer.jobRoleId,
              applicationStatusId: interviewingStatus.applicationStatusId,
            },
          ]
        : []),
      ...(bob?.userId
        ? [
            {
              userId: bob.userId,
              jobRoleId: uiDesigner.jobRoleId,
              applicationStatusId: appliedStatus.applicationStatusId,
            },
          ]
        : []),
      ...(bob?.userId
        ? [
            {
              userId: bob.userId,
              jobRoleId: uxResearcher.jobRoleId,
              applicationStatusId: hiredStatus.applicationStatusId,
            },
          ]
        : []),
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
