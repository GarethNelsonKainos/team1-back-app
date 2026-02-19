/**
 * Feature flag configuration and utilities
 * Centralized place to manage feature toggles
 */

export const FEATURE_FLAGS = {
  ADMIN_CREATE_JOB_ROLE: process.env.ENABLE_ADD_JOB_ROLE === 'true',
};

/**
 * Check if job applications are enabled
 * @returns boolean indicating if the feature is enabled
 */
export function isJobApplicationsEnabled(): boolean {
  const flag = process.env.ENABLE_JOB_APPLICATIONS;

  // Default to false for security (opt-in rather than opt-out)
  if (!flag) return false;

  // Handle various truthy values
  return flag.toLowerCase() === 'true' || flag === '1';
}

export function isAdminCreateJobRoleEnabled(): boolean {
  return FEATURE_FLAGS.ADMIN_CREATE_JOB_ROLE;
}

/**
 * Get all feature flags for debugging/admin purposes
 * @returns object with all current feature flag states
 */
export function getAllFlags(): Record<string, boolean> {
  return {
    jobApplications: isJobApplicationsEnabled(),
    adminCreateJobRole: isAdminCreateJobRoleEnabled(),
  };
}
