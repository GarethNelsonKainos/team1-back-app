import 'dotenv/config';
import { type PrismaConfig, defineConfig } from 'prisma/config';

const databaseUrl =
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}` +
  `@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}` +
  `?schema=${process.env.DB_SCHEMA}`;

const config: PrismaConfig = {
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: databaseUrl,
  },
};

export default defineConfig(config);
