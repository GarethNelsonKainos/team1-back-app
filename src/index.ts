import dotenv from 'dotenv';
import express from 'express';
import { jobRoleController } from './controllers/JobRoleController.js';

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Job Roles API
app.get('/api/job-roles', (req, res) =>
  jobRoleController.getJobRoles(req, res),
);

export default app;
