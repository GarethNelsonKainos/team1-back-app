import express from 'express';
import { uploadCVHandler, uploadMiddleware } from '../handlers/cv.handler';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// CV upload route - requires authentication
router.post('/upload', authMiddleware(), uploadMiddleware, uploadCVHandler);

export default router;
