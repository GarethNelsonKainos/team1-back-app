import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import AuthController from './controllers/AuthController.js';
import { prisma } from './db/prisma.js';
import jobRoleRoutes from './routes/JobRoleRoutes.js';
import authRoutes from './routes/auth.routes.js';

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

app.use('/api/auth', authRouter(authController));

app.use('/api', jobRoleRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
