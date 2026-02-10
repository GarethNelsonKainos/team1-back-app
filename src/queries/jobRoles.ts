import pool from '../db.js';
import type { JobRoleResponse } from '../models/JobRoleResponse.js';

export async function getJobRoles(): Promise<JobRoleResponse[]> {
  const query = `
    SELECT 
      jr.job_role_id as "jobRoleId",
      jr.role_name as "roleName",
      jr.location,
      c.capability_name as capability,
      b.band_name as band,
      jr.closing_date as "closingDate"
    FROM job_roles jr
    JOIN capability c ON jr.capability_id = c.capability_id
    JOIN band b ON jr.band_id = b.band_id
    WHERE jr.status = 'open'
    ORDER BY jr.closing_date ASC
  `;
  
  const result = await pool.query(query);
  return result.rows;
}
