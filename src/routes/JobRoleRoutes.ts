import { Router } from 'express';
import { JobRoleController } from '../controllers/JobRoleController.js';
import { JobRoleDAO } from '../db/JobRoleDAO.js';
import { prisma } from '../db/prisma.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { JobRoleService } from '../services/JobRoleService.js';

const router = Router();

// Initialize job role dependencies
const jobRoleDAO = new JobRoleDAO(prisma);
const jobRoleService = new JobRoleService(jobRoleDAO);
const jobRoleController = new JobRoleController(jobRoleService);

// Job Roles API routes
router.get('/job-roles', authMiddleware, (req, res) =>
  jobRoleController.getJobRoles(req, res),
);

router.get('/job-roles/:id', authMiddleware, (req, res) =>
  jobRoleController.getJobRoleById(req, res),
);

export default router;
