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
      userPassword: '$2a$12$eYBOWX9Dy9Kz4tHKifurDuv9l25aaiblH8AKFWimKLk/txJhDNtMy',
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
      userPassword: '$2a$12$hw7jW1u2dTrQTFXGqaVIeuVbZl8IIf0NIZx8E5W8VoFdHQK7pzJ7y',
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
      userPassword: '$2a$12$GoHDUNga9WtNagltqn83T.6UKZ/E4d7P64S2saW0Xzd2adzSbbUDa',
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
    { locationName: 'Belfast Office', city: 'Belfast', country: 'UK' },
    { locationName: 'Derry Office', city: 'Londonderry', country: 'UK' },
    { locationName: 'Birmingham Office', city: 'Birmingham', country: 'UK' },
    { locationName: 'London Office', city: 'London', country: 'UK' },
    { locationName: 'Dublin Office', city: 'Dublin', country: 'Ireland' },
    { locationName: 'Gdansk Office', city: 'Gdansk', country: 'Poland' },
    { locationName: 'Helsinki Office', city: 'Helsinki', country: 'Finland' },
    { locationName: 'Paris Office', city: 'Paris', country: 'France' },
    { locationName: 'Wommelgem Office', city: 'Wommelgem', country: 'Belgium' },
    { locationName: 'Buenos Aires Office', city: 'Buenos Aires', country: 'Argentina' },
    { locationName: 'Indianapolis Office', city: 'Indianapolis', country: 'USA' },
    { locationName: 'Nova Scotia Office', city: 'Nova Scotia', country: 'Canada' },
    { locationName: 'Toronto Office', city: 'Toronto', country: 'Canada' },
    { locationName: 'Remote', city: 'Remote', country: 'Remote' },
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
    jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Engineering/Job%20profile%20-%20Senior%20Software%20Engieneer%20(Senior%20Associate).pdf',
    openPositions: 3,
    locations: ['London Office', 'Remote'],
  },
  {
    roleName: 'Test Engineer',
    capabilityId: capabilities['Testing and Quality Assurance'].capabilityId,
    bandId: bands['Consultant'].bandId,
    closingDate: new Date('2026-04-01'),
    jobRoleStatusId: openStatus.jobRoleStatusId,
    description: 'Ensures the quality of software products.',
    responsibilities: 'Test applications, report bugs, write test cases.',
    jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Engineering/Job%20profile%20-%20Test%20Manager%20(Consultant).pdf',
    openPositions: 2,
    locations: ['Belfast Office', 'Remote'],
  },
  {
    roleName: 'Technical Architect',
    capabilityId: capabilities['Architecture'].capabilityId,
    bandId: bands['Principal'].bandId,
    closingDate: new Date('2026-05-01'),
    jobRoleStatusId: openStatus.jobRoleStatusId,
    description: 'Designs technical solutions and system architecture.',
    responsibilities: 'Define architecture, review designs, mentor engineers.',
    jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Engineering/Job%20Profile%20-%20Principal%20Architect%20(Principal).pdf',
    openPositions: 1,
    locations: ['London Office'],
  },
  {
    roleName: 'Low Code Principal Architect',
    capabilityId: capabilities['Low Code Engineering'].capabilityId,
    bandId: bands['Principal'].bandId,
    closingDate: new Date('2026-06-01'),
    jobRoleStatusId: openStatus.jobRoleStatusId,
    description: 'Leads low code architecture and strategy.',
    responsibilities: 'Architect low code solutions, lead teams, ensure best practices.',
    jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Engineering/Job%20Profile%20-%20Low%20Code%20Principal%20Architect%20(P)%20-%20Low%20Code.pdf',
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
      cvUrl: 'https://example.com/cv/alice-cv.pdf',
    },
  });
}
if (alice && jobRoleTestEngineer && applicationStatuses['In Review']) {
  await prisma.application.create({
    data: {
      userId: alice.userId,
      jobRoleId: jobRoleTestEngineer.jobRoleId,
      applicationStatusId: applicationStatuses['In Review'].applicationStatusId,
      cvUrl: 'https://example.com/cv/alice-cv.pdf',},
  });
}
if (bob && jobRoleTechnicalArchitect && applicationStatuses['Offered Interview']) {
  await prisma.application.create({
    data: {
      userId: bob.userId,
      jobRoleId: jobRoleTechnicalArchitect.jobRoleId,
      applicationStatusId: applicationStatuses['Offered Interview'].applicationStatusId,
      cvUrl: 'https://example.com/cv/bob-cv.pdf',
    },
  });
}
if (bob && jobRoleSoftwareEngineer && applicationStatuses['Rejected']) {
  await prisma.application.create({
    data: {
      userId: bob.userId,
      jobRoleId: jobRoleSoftwareEngineer.jobRoleId,
      applicationStatusId: applicationStatuses['Rejected'].applicationStatusId,
      cvUrl: 'https://example.com/cv/bob-cv.pdf',
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