import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import AuthController from './controllers/AuthController.js';
import { prisma } from './db/prisma.js';
import jobRoleRoutes from './routes/JobRoleRoutes.js';
import applicationRoutes from './routes/application.routes.js';
import authRouter from './routes/authRouter.js';
import cvRoutes from './routes/cv.routes.js';
import { AuthService } from './services/AuthService.js';

dotenv.config();


const app = express();
const PORT: number = Number(process.env.PORT) || 3001;

const authController = new AuthController(new AuthService(prisma));

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

// Application routes
app.use('/api/applications', applicationRoutes);

// CV upload routes
app.use('/api/cv', cvRoutes);

// Routes
app.use('/api/auth', authRouter(authController));
app.use('/api', jobRoleRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/cv', cvRoutes);

// Application routes
app.use('/api/applications', applicationRoutes);

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
