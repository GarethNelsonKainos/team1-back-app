import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { buildConnectionStringFromEnv } from '../utils/db-connection-generator';

const databaseUrl = buildConnectionStringFromEnv();

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set!');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
