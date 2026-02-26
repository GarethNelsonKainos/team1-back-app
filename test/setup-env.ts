import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.JWT_SECRET = 'test-jwt-secret-value-for-testing-only';
process.env.BCRYPT_SALT_ROUNDS = '10';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.PORT = '3001';
process.env.ENABLE_ADD_JOB_ROLE = 'true';