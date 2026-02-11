import 'dotenv/config';
import cors from 'cors';
import express from 'express';
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

// Auth routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
