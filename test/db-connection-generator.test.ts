import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildConnectionStringFromEnv } from '../src/utils/db-connection-generator';

describe('buildConnectionStringFromEnv', () => {
  const OLD_ENV = { ...process.env };

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  const clearEnv = () => {
    process.env.DB_USER = undefined;
    process.env.DB_PASSWORD = undefined;
    process.env.DB_HOST = undefined;
    process.env.DB_PORT = undefined;
    process.env.DB_NAME = undefined;
    process.env.DB_SCHEMA = undefined;
  };

  it('should build a connection string with all env variables', () => {
    clearEnv();
    process.env.DB_USER = 'user';
    process.env.DB_PASSWORD = 'pass';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'testdb';
    process.env.DB_SCHEMA = 'public';

    const connStr = buildConnectionStringFromEnv();
    expect(connStr).toBe(
      'postgresql://user:pass@localhost:5432/testdb?schema=public',
    );
  });

  it('should build a connection string with only required env variables', () => {
    clearEnv();
    process.env.DB_USER = 'user';
    process.env.DB_HOST = 'localhost';
    process.env.DB_NAME = 'testdb';

    const connStr = buildConnectionStringFromEnv();
    expect(connStr).toBe('postgresql://user@localhost/testdb');
  });

  it('should build a connection string with no env variables', () => {
    clearEnv();
    const connStr = buildConnectionStringFromEnv();
    expect(connStr).toBe('postgresql://');
  });
});
