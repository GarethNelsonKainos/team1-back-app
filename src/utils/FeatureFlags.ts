/**
 * Feature flag configuration and utilities
 * Centralized place to manage feature toggles
 */

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

/**
 * Get all feature flags for debugging/admin purposes
 * @returns object with all current feature flag states
 */
export function getAllFlags(): Record<string, boolean> {
  return {
    jobApplications: isJobApplicationsEnabled(),
  };
}
