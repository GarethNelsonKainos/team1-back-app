import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { ApplicationController } from './controllers/ApplicationController.js';
import AuthController from './controllers/AuthController.js';
import { prisma } from './db/prisma';
import jobRoleRoutes from './routes/JobRoleRoutes';
import applicationRoutes from './routes/application.routes';
import authRouter from './routes/authRouter';
import { AuthService } from './services/AuthService';
import { ApplicationService } from './services/application.service.js';
import { S3Service } from './services/s3.service.js';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3001;

const authController = new AuthController(new AuthService(prisma));
const applicationController = new ApplicationController(
  new ApplicationService(prisma, new S3Service()),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter(authController));

app.use('/api', jobRoleRoutes);

app.use('/api/applications', applicationRoutes(applicationController));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
