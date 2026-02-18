import { type Request, type Response, Router } from 'express';
import multer from 'multer';
import { ApplicationController } from '../controllers/ApplicationController';
import { prisma } from '../db/prisma';
import { authMiddleware } from '../middleware/auth.middleware';
import { ApplicationService } from '../services/application.service';
import { S3Service } from '../services/s3.service';

const router = Router();

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

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
 * Create a new job application (requires authentication)
 */
router.post(
  '/',
  authMiddleware(),
  upload.single('cv'),
  (req: Request, res: Response) => getController().createApplication(req, res),
);

/**
 * GET /api/applications/status/:jobRoleId
 * Check if user has already applied for a specific job role (requires authentication)
 */
router.get(
  '/status/:jobRoleId',
  authMiddleware(),
  (req: Request, res: Response) =>
    getController().checkApplicationStatus(req, res),
);

export default router;
