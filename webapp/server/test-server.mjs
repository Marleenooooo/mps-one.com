import express from 'express';

const app = express();
const port = 3002;

// Test analytics endpoint
app.get('/bridge/analytics/funnel', (req, res) => {
  console.log('Funnel endpoint hit!');
  res.json({ test: 'funnel data' });
});

app.listen(port, () => {
  console.log(`Test server listening on http://localhost:${port}`);
});

// Keep the process alive
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});