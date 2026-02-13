import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { buildConnectionStringFromEnv } from '../../src/utils/db-connection-generator';

const connectionString = buildConnectionStringFromEnv();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding test database...');

  // User Types
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

  // Users
  await prisma.user.upsert({
    where: { userEmail: 'alice@example.com' },
    update: {},
    create: {
      firstName: 'Alice',
      lastName: 'Applicant',
      userEmail: 'alice@example.com',
      userPassword: '$2a$10$kU6TaZQTUHgGr52EG4xWkeNvdUVSlWnR27H7wnGhV1tW/4ATdX/rG',
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
      userPassword: '$2a$10$kU6TaZQTUHgGr52EG4xWkeNvdUVSlWnR27H7wnGhV1tW/4ATdX/rG',
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
      userPassword: '$2a$10$kU6TaZQTUHgGr52EG4xWkeNvdUVSlWnR27H7wnGhV1tW/4ATdX/rG',
      userTypeId: adminType.userTypeId,
    },
  });

  // Bands
  const bandNames = [
    'Leadership Community',
    'Principal',
    'Manager',
    'Consultant',
    'Senior Associate',
    'Associate',
    'Trainee',
    'Apprentice',
  ];
  const bands: Record<string, any> = {};
  for (const name of bandNames) {
    bands[name] = await prisma.band.upsert({
      where: { bandName: name },
      update: {},
      create: { bandName: name },
    });
  }

  // Capabilities
  const capabilityNames = [
    'Engineering, Strategy and Planning',
    'Engineering',
    'Architecture',
    'Testing and Quality Assurance',
    'Product Specialist',
    'Low Code Engineering',
  ];
  const capabilities: Record<string, any> = {};
  for (const name of capabilityNames) {
    capabilities[name] = await prisma.capability.upsert({
      where: { capabilityName: name },
      update: {},
      create: { capabilityName: name },
    });
  }

  // Job Role Status
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


  // Locations
  const locationNames = [
    { locationName: 'London', city: 'London', country: 'UK' },
    { locationName: 'Belfast', city: 'Belfast', country: 'UK' },
    { locationName: 'Remote', city: 'Remote', country: 'Global' },
  ];
  const locations: Record<string, any> = {};
  for (const loc of locationNames) {
    locations[loc.locationName] = await prisma.location.upsert({
      where: { locationName: loc.locationName },
      update: {},
      create: { locationName: loc.locationName, city: loc.city, country: loc.country },
    });
  }

  // ApplicationStatus
const applicationStatusNames = [
  'Submitted',
  'In Review',
  'Rejected',
  'Offered Interview',
  'Hired',
];
const applicationStatuses: Record<string, any> = {};
for (const name of applicationStatusNames) {
  applicationStatuses[name] = await prisma.applicationStatus.upsert({
    where: { applicationStatusType: name },
    update: {},
    create: { applicationStatusType: name },
  });
}

  // Example JobRoles (create and store for relation)
const jobRoles = [
  {
    roleName: 'Software Engineer',
    capabilityId: capabilities['Engineering'].capabilityId,
    bandId: bands['Senior Associate'].bandId,
    closingDate: new Date('2026-03-01'),
    jobRoleStatusId: openStatus.jobRoleStatusId,
    description: 'Develops and maintains software applications.',
    responsibilities: 'Write code, review code, participate in agile ceremonies.',
    jobSpecLink: 'https://company.sharepoint.com/software-engineer',
    openPositions: 3,
    locations: ['London', 'Remote'],
  },
  {
    roleName: 'Test Engineer',
    capabilityId: capabilities['Testing and Quality Assurance'].capabilityId,
    bandId: bands['Consultant'].bandId,
    closingDate: new Date('2026-04-01'),
    jobRoleStatusId: openStatus.jobRoleStatusId,
    description: 'Ensures the quality of software products.',
    responsibilities: 'Test applications, report bugs, write test cases.',
    jobSpecLink: 'https://company.sharepoint.com/test-engineer',
    openPositions: 2,
    locations: ['Belfast', 'Remote'],
  },
  {
    roleName: 'Technical Architect',
    capabilityId: capabilities['Architecture'].capabilityId,
    bandId: bands['Principal'].bandId,
    closingDate: new Date('2026-05-01'),
    jobRoleStatusId: openStatus.jobRoleStatusId,
    description: 'Designs technical solutions and system architecture.',
    responsibilities: 'Define architecture, review designs, mentor engineers.',
    jobSpecLink: 'https://company.sharepoint.com/technical-architect',
    openPositions: 1,
    locations: ['London'],
  },
  {
    roleName: 'Low Code Principal Architect',
    capabilityId: capabilities['Low Code Engineering'].capabilityId,
    bandId: bands['Principal'].bandId,
    closingDate: new Date('2026-06-01'),
    jobRoleStatusId: openStatus.jobRoleStatusId,
    description: 'Leads low code architecture and strategy.',
    responsibilities: 'Architect low code solutions, lead teams, ensure best practices.',
    jobSpecLink: 'https://company.sharepoint.com/low-code-principal-architect',
    openPositions: 1,
    locations: ['Remote'],
  },
];

// Create JobRoles and connect to locations
for (const jr of jobRoles) {
  const jobRole = await prisma.jobRole.upsert({
    where: { roleName: jr.roleName },
    update: {},
    create: {
      roleName: jr.roleName,
      capabilityId: jr.capabilityId,
      bandId: jr.bandId,
      closingDate: jr.closingDate,
      jobRoleStatusId: jr.jobRoleStatusId,
      description: jr.description,
      responsibilities: jr.responsibilities,
      jobSpecLink: jr.jobSpecLink,
      openPositions: jr.openPositions,
    },
  });

  // Connect jobRole to locations via JobRoleLocation
  for (const locName of jr.locations) {
    await prisma.jobRoleLocation.upsert({
      where: {
        jobRoleId_locationId: {
          jobRoleId: jobRole.jobRoleId,
          locationId: locations[locName].locationId,
        },
      },
      update: {},
      create: {
        jobRoleId: jobRole.jobRoleId,
        locationId: locations[locName].locationId,
      },
    });
  }
}

// Link Applicants to JobRoles in Application table with various ApplicationStatuses
const alice = await prisma.user.findUnique({ where: { userEmail: 'alice@example.com' } });
const bob = await prisma.user.findUnique({ where: { userEmail: 'bob@example.com' } });

const jobRoleSoftwareEngineer = await prisma.jobRole.findUnique({ where: { roleName: 'Software Engineer' } });
const jobRoleTestEngineer = await prisma.jobRole.findUnique({ where: { roleName: 'Test Engineer' } });
const jobRoleTechnicalArchitect = await prisma.jobRole.findUnique({ where: { roleName: 'Technical Architect' } });

if (alice && jobRoleSoftwareEngineer && applicationStatuses['Submitted']) {
  await prisma.application.create({
    data: {
      userId: alice.userId,
      jobRoleId: jobRoleSoftwareEngineer.jobRoleId,
      applicationStatusId: applicationStatuses['Submitted'].applicationStatusId,
    },
  });
}
if (alice && jobRoleTestEngineer && applicationStatuses['In Review']) {
  await prisma.application.create({
    data: {
      userId: alice.userId,
      jobRoleId: jobRoleTestEngineer.jobRoleId,
      applicationStatusId: applicationStatuses['In Review'].applicationStatusId,
    },
  });
}
if (bob && jobRoleTechnicalArchitect && applicationStatuses['Offered Interview']) {
  await prisma.application.create({
    data: {
      userId: bob.userId,
      jobRoleId: jobRoleTechnicalArchitect.jobRoleId,
      applicationStatusId: applicationStatuses['Offered Interview'].applicationStatusId,
    },
  });
}
if (bob && jobRoleSoftwareEngineer && applicationStatuses['Rejected']) {
  await prisma.application.create({
    data: {
      userId: bob.userId,
      jobRoleId: jobRoleSoftwareEngineer.jobRoleId,
      applicationStatusId: applicationStatuses['Rejected'].applicationStatusId,
    },
  });
}
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