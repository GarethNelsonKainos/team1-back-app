import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jobRoleRoutes from './routes/JobRoleRoutes.js';
import applicationRoutes from './routes/application.routes.js';
import cvRoutes from './routes/cv.routes.js';

// Load environment variables
dotenv.config();
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT: number = Number(process.env.PORT) || 3001;

// Basic middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use('/api/auth', authRoutes);

// Application routes
app.use('/api/applications', applicationRoutes);

// CV upload routes
app.use('/api/cv', cvRoutes);

// Routes
app.use('/api', jobRoleRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
