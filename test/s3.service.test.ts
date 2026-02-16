import { describe, expect, it } from 'vitest';
import { S3Service } from '../src/services/s3.service.js';

describe('S3Service', () => {
  describe('constructor', () => {
    it('should throw error when AWS environment variables are missing', () => {
      // Store original env
      const originalEnv = process.env;

      // Clear AWS environment variables
      process.env = {
        ...originalEnv,
        AWS_REGION: undefined,
        AWS_ACCESS_KEY_ID: undefined,
        AWS_SECRET_ACCESS_KEY: undefined,
        S3_BUCKET_NAME: undefined,
      };

      expect(() => new S3Service()).toThrow(
        'Missing required AWS environment variables',
      );

      // Restore original env
      process.env = originalEnv;
    });

    it('should create instance successfully with valid environment variables', () => {
      // Ensure env vars are available for this test
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_ACCESS_KEY_ID = 'test-key';
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
      process.env.S3_BUCKET_NAME = 'test-bucket';

      expect(() => new S3Service()).not.toThrow();
    });
  });
});
