import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}` +
                         `@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.TEST_DB_NAME}` +
                         `?schema=${process.env.DB_SCHEMA}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding test database...')

  // ---------------------------
  // 1️⃣ User Types
  // ---------------------------
  await prisma.userType.createMany({
    data: [
      { userTypeDesc: 'Applicant' },
      { userTypeDesc: 'Admin' },
    ],
    skipDuplicates: true,
  })

  // ---------------------------
  // 2️⃣ Users
  // ---------------------------
  await prisma.user.createMany({
    data: [
      { firstName: 'Alice', lastName: 'Applicant', userEmail: 'alice@example.com', userPassword: 'password1', userTypeId: 1 },
      { firstName: 'Bob', lastName: 'Applicant', userEmail: 'bob@example.com', userPassword: 'password2', userTypeId: 1 },
      { firstName: 'Charlie', lastName: 'Admin', userEmail: 'charlie@example.com', userPassword: 'adminpass', userTypeId: 2 },
    ],
    skipDuplicates: true,
  })

  // ---------------------------
  // 3️⃣ Capabilities
  // ---------------------------
  await prisma.capability.createMany({
    data: [
      { capabilityName: 'Engineering' },
      { capabilityName: 'Design' },
      { capabilityName: 'Marketing' },
    ],
    skipDuplicates: true,
  })

  // ---------------------------
  // 4️⃣ Bands
  // ---------------------------
  await prisma.band.createMany({
    data: [
      { bandName: 'Band A' },
      { bandName: 'Band B' },
      { bandName: 'Band C' },
    ],
    skipDuplicates: true,
  })

  // ---------------------------
  // 5️⃣ Job Role Status
  // ---------------------------
  await prisma.jobRoleStatus.createMany({
    data: [
      { statusName: 'Open' },
      { statusName: 'Closed' },
    ],
    skipDuplicates: true,
  })

  // ---------------------------
  // 6️⃣ Locations
  // ---------------------------
  await prisma.location.createMany({
    data: [
      { locationName: 'HQ', city: 'London', country: 'UK' },
      { locationName: 'Remote', city: 'Online', country: 'Global' },
    ],
    skipDuplicates: true,
  })

  // ---------------------------
  // 7️⃣ Job Roles
  // ---------------------------
  await prisma.jobRole.createMany({
    data: [
      { roleName: 'Frontend Engineer', capabilityId: 1, bandId: 1, closingDate: new Date(), jobRoleStatusId: 1 },
      { roleName: 'Backend Engineer', capabilityId: 1, bandId: 2, closingDate: new Date(), jobRoleStatusId: 1 },
      { roleName: 'UI Designer', capabilityId: 2, bandId: 1, closingDate: new Date(), jobRoleStatusId: 1 },
      { roleName: 'UX Researcher', capabilityId: 2, bandId: 2, closingDate: new Date(), jobRoleStatusId: 1 },
      { roleName: 'Marketing Manager', capabilityId: 3, bandId: 3, closingDate: new Date(), jobRoleStatusId: 1 },
      { roleName: 'Content Strategist', capabilityId: 3, bandId: 3, closingDate: new Date(), jobRoleStatusId: 1 },
    ],
    skipDuplicates: true,
  })

  // ---------------------------
  // 8️⃣ Application Status
  // ---------------------------
  await prisma.applicationStatus.createMany({
    data: [
      { applicationStatusType: 'Applied' },
      { applicationStatusType: 'Interviewing' },
      { applicationStatusType: 'Hired' },
      { applicationStatusType: 'Rejected' },
    ],
    skipDuplicates: true,
  })

  // ---------------------------
  // 9️⃣ JobRoleLocation (many-to-many)
  // ---------------------------
  await prisma.jobRoleLocation.createMany({
    data: [
      { jobRoleId: 1, locationId: 1 },
      { jobRoleId: 2, locationId: 1 },
      { jobRoleId: 3, locationId: 2 },
      { jobRoleId: 4, locationId: 2 },
      { jobRoleId: 5, locationId: 1 },
      { jobRoleId: 6, locationId: 2 },
    ],
    skipDuplicates: true,
  })

  // ---------------------------
  // 🔟 Applications
  // ---------------------------
  await prisma.application.createMany({
    data: [
      { userId: 1, jobRoleId: 1, applicationStatusId: 1 },
      { userId: 1, jobRoleId: 2, applicationStatusId: 2 },
      { userId: 2, jobRoleId: 3, applicationStatusId: 1 },
      { userId: 2, jobRoleId: 4, applicationStatusId: 3 },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed complete')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })