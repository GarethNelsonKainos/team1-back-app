import { Router } from 'express';
import { ApplicationController } from '../controllers/ApplicationController';
import { prisma } from '../db/prisma';
import { uploadMiddleware } from '../handlers/cv.handler';
import { authMiddleware } from '../middleware/auth.middleware';
import { ApplicationService } from '../services/application.service';
import { S3Service } from '../services/s3.service';
//import { createApplicationHandler } from '../handlers/application.handler';

const router = Router();

// Lazy initialization to avoid creating S3Service during module load (requires env vars)
let applicationController: ApplicationController;

function getController(): ApplicationController {
  if (!applicationController) {
    const s3Service = new S3Service();
    const applicationService = new ApplicationService(prisma, s3Service);
    applicationController = new ApplicationController(applicationService);
  }
  return applicationController;
}

/**
 * POST /api/applications
 * Create a new job application with optional CV upload (requires authentication)
 */
router.post('/', authMiddleware, uploadMiddleware, (req, res) =>
  getController().createApplication(req, res),
);

/**
 * GET /api/applications/status/:jobRoleId
 * Check if user has already applied for a specific job role (requires authentication)
 */
router.get('/status/:jobRoleId', authMiddleware, (req, res) =>
  getController().checkApplicationStatus(req, res),
);

/**
 * POST /api/applications
 * Create a new job application (requires authentication)
 */
//router.post('/', authMiddleware, (req, res) =>
//  createApplicationHandler(req, res, prisma),
//);

export default router;
