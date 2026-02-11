import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, DB_SCHEMA } =
  process.env;

process.env.DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}`;

// Set test environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '10';
process.env.REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
