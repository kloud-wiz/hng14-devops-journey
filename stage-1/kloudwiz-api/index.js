const express = require('express');
const app = express();

// 1. Disable ETag generation (Prevents 304)
app.set('etag', false);

// 2. Middleware to force "No Cache" headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const PORT = 3000;

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'healthy' });
});

app.get('/me', (req, res) => {
  res.status(200).json({
    name: 'Wisdom Emmanuel',
    email: 'emmanuelwisdom95@gmail.com',
    github: 'https://github.com/kloud-wiz'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
