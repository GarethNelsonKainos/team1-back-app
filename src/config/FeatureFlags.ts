export const FEATURE_FLAGS = {
  ADMIN_CREATE_JOB_ROLE: process.env.FEATURE_ADMIN_CREATE_JOB_ROLE === 'true',
} as const;