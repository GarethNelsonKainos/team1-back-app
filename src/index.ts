import dotenv from 'dotenv';
import express from 'express';
import { getJobRoles } from './controllers/JobRoleController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3001;

// Basic middleware
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Job Roles API
app.get('/api/job-roles', getJobRoles);

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
