const express = require('express');
const path = require('path');
const { createClient } = require('redis');

const app = express();
const port = process.env.PORT || 3000;

// สร้าง Redis client
const redis = createClient({
  url: process.env.STORAGE_URL || process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error:', err));

// เชื่อมต่อ Redis Database
redis.connect();

app.use(express.json({ limit: '10mb' }));

// Key prefix
const KEY_PREFIX = 'letter:';

// 1. Route สำหรับหน้าแรก (เสิร์ฟ index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. API Routes
app.get('/api/letters/:slug', async (req, res) => {
  try {
    const rawData = await redis.get(KEY_PREFIX + req.params.slug);
    if (!rawData) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    const row = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    res.json(row);
  } catch (error) {
    console.error('Failed to load letter:', error);
    res.status(500).json({ error: 'Something went wrong loading this letter.' });
  }
});

app.post('/api/letters', async (req, res) => {
  try {
    const { greeting, message, signature, theme, stickers, photo } = req.body;
    const slug = generateSlug();

    const letter = {
      slug,
      greeting,
      message,
      signature,
      theme,
      stickers: stickers || [],
      photo: photo || '',
      createdAt: new Date().toISOString()
    };

    await redis.set(KEY_PREFIX + slug, JSON.stringify(letter));

    res.json({ slug, shareUrl: `/letter/${slug}` });
  } catch (error) {
    console.error('Failed to save letter:', error);
    res.status(500).json({ error: 'Something went wrong saving this letter.' });
  }
});

// 3. Route สำหรับการดูจดหมายผ่านลิงก์
app.get('/letter/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function generateSlug() {
  return Math.random().toString(36).slice(2, 10);
}

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Love Letter server running on http://localhost:${port}`);
  });
}

module.exports = app;