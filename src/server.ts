import app from './index.js';

const PORT: number = Number(process.env.PORT) || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
