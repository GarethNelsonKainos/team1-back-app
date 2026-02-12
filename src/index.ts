import dotenv from 'dotenv';
import express from 'express';
import jobRoleRoutes from './routes/JobRoleRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3001;

// Basic middleware
app.use(express.json());

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
