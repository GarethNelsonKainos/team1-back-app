import { type Request, type Response, Router } from 'express';
import multer from 'multer';
import type { ApplicationController } from '../controllers/ApplicationController';
import { authMiddleware } from '../middleware/auth.middleware.js';

const FIVE_MEGAYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: FIVE_MEGAYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export default function applicationRoutes(
  applicationController: ApplicationController,
) {
  const router = Router();

  router.post(
    '/',
    authMiddleware(),
    upload.single('cv'),
    (req: Request, res: Response) =>
      applicationController.createApplication(req, res),
  );

  return router;
}
