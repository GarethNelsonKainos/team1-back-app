import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import applicationRoutes from './routes/application.routes.js';
import AuthController from './controllers/AuthController.js';
import { prisma } from './db/prisma.js';
import jobRoleRoutes from './routes/JobRoleRoutes.js';
import authRoutes from './routes/authRouter.js';
import authRouter from './routes/authRouter.js';
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

app.use('/api/auth', authRouter(authController));

app.use('/api', jobRoleRoutes);

// Application routes
app.use('/api/applications', applicationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
