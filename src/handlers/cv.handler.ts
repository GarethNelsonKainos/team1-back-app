import type { Request, Response } from 'express';
import multer from 'multer';
import { S3Service } from '../services/s3.service';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Only allow PDF files for CVs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export const uploadMiddleware = upload.single('cv');

export async function uploadCVHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const s3Service = new S3Service();
    const fileUrl = await s3Service.uploadFile(req.file, req.user.userId);

    res.status(200).json({
      message: 'CV uploaded successfully',
      fileUrl,
    });
  } catch (error) {
    console.error('Error uploading CV:', error);

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'File too large (max 5MB)' });
        return;
      }
    }

    res.status(500).json({ error: 'Failed to upload CV' });
  }
}
