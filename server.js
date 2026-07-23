const express = require('express');
const path = require('path');
const { createClient } = require('redis');

const app = express();
const port = process.env.PORT || 3000;

// ให้ Express เปิดอ่านไฟล์ Static (styles.css, app.js) จากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

const memoryStore = new Map();
const redisUrl = process.env.STORAGE_URL || process.env.REDIS_URL || process.env.KV_URL;

let redisClient = null;
if (redisUrl && (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://'))) {
  redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (err) => console.error('Redis Error:', err.message));
}

async function getRedis() {
  if (!redisClient) return null;
  try {
    if (!redisClient.isOpen) await redisClient.connect();
    return redisClient;
  } catch (err) {
    return null;
  }
}

const KEY_PREFIX = 'letter:';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/letters/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const client = await getRedis();
    let rawData = client ? await client.get(KEY_PREFIX + slug) : memoryStore.get(KEY_PREFIX + slug);
    if (!rawData) return res.status(404).json({ error: 'Letter not found' });
    const row = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: 'Error loading letter' });
  }
});

app.post('/api/letters', async (req, res) => {
  try {
    const { greeting, message, signature, theme, stickers, photo } = req.body;
    const slug = Math.random().toString(36).slice(2, 10);
    const letter = { slug, greeting, message, signature, theme, stickers: stickers || [], photo: photo || '', createdAt: new Date().toISOString() };
    const client = await getRedis();
    const jsonString = JSON.stringify(letter);

    if (client) {
      await client.set(KEY_PREFIX + slug, jsonString);
    } else {
      memoryStore.set(KEY_PREFIX + slug, jsonString);
    }
    res.json({ slug, shareUrl: `/letter/${slug}` });
  } catch (error) {
    res.status(500).json({ error: 'Error saving letter' });
  }
});

app.get('/letter/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;