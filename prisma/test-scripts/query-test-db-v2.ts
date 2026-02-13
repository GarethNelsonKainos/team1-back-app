import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { buildConnectionStringFromEnv } from '../../src/utils/db-connection-generator';

const connectionString = buildConnectionStringFromEnv();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const capabilities = await prisma.capability.findMany();
  const bands = await prisma.band.findMany();
  const jobRoles = await prisma.jobRole.findMany();
  const locations = await prisma.location.findMany();
  const jobRoleLocations = await prisma.jobRoleLocation.findMany();
  const userTypes = await prisma.userType.findMany();
  const users = await prisma.user.findMany();
  const applicationStatuses = await prisma.applicationStatus.findMany();
  const jobRoleStatuses = await prisma.jobRoleStatus.findMany();
  const applications = await prisma.application.findMany();

  console.log('Capabilities:', capabilities);
  console.log('Bands:', bands);
  console.log('JobRoles:', jobRoles);
  console.log('Locations:', locations);
  console.log('JobRoleLocations:', jobRoleLocations);
  console.log('UserTypes:', userTypes);
  console.log('Users:', users);
  console.log('ApplicationStatuses:', applicationStatuses);
  console.log('JobRoleStatuses:', jobRoleStatuses);
  console.log('Applications:', applications);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });