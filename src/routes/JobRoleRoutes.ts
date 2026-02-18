import type { Request, Response } from 'express';
import { Router } from 'express';
import { JobRoleController } from '../controllers/JobRoleController.js';
import { JobRoleDAO } from '../db/JobRoleDAO.js';
import { prisma } from '../db/prisma.js';
import { adminAuthMiddleware } from '../middleware/admin-authorization.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { JobRoleService } from '../services/JobRoleService.js';

const router = Router();

// Initialize job role dependencies
const jobRoleDAO = new JobRoleDAO(prisma);
const jobRoleService = new JobRoleService(jobRoleDAO);
const jobRoleController = new JobRoleController(jobRoleService);

// Job Roles API routes

router.get('/job-roles', (req, res) => jobRoleController.getJobRoles(req, res));
router.get('/job-roles/:id', (req, res) =>
  jobRoleController.getJobRoleById(req, res),
);

// Delete job role (admin only)
router.delete(
  '/job-roles/:id',
  authMiddleware,
  adminAuthMiddleware,
  (req: Request, res: Response) => jobRoleController.deleteJobRole(req, res),
);

export default router;
