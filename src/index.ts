import express from 'express';
import dotenv from 'dotenv';
import { fetchJobRoles } from './services/JobRoleService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 8080;

// Basic middleware
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Get all open job roles
app.get('/api/job-roles', async (req, res) => {
  try {
    const roles = await fetchJobRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Unable to fetch job roles' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;