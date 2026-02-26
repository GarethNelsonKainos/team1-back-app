import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'kainos-jobs';
process.env.DB_SCHEMA = process.env.DB_SCHEMA || 'public';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.PORT = '3001';
process.env.ENABLE_ADD_JOB_ROLE = 'true';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '10';
process.env.REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

process.env.AWS_ACCESS_KEY_ID =
  process.env.AWS_ACCESS_KEY_ID || 'test-access-key-id';
process.env.AWS_SECRET_ACCESS_KEY =
  process.env.AWS_SECRET_ACCESS_KEY || 'test-secret-access-key';
process.env.AWS_REGION = process.env.AWS_REGION || 'eu-west-1';
process.env.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'test-bucket';
