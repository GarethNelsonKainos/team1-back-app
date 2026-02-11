import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';

// Validate DATABASE_URL at startup
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Initialize PostgreSQL connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

// Create and export singleton Prisma client
export const prisma = new PrismaClient({ adapter });

// Graceful shutdown helper
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  await pool.end();
}
