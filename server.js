const express = require('express');
const path = require('path');
const { createClient } = require('redis');

const app = express();
const port = process.env.PORT || 3000;

// ดึง Redis URL จาก Environment Variable หลายๆ ชื่อที่ Vercel มักจะตั้งให้
const redisUrl = process.env.STORAGE_URL || process.env.REDIS_URL || process.env.KV_URL;

const useRedis = Boolean(redisUrl);
const redis = useRedis ? createClient({ url: redisUrl }) : null;
const fallbackStore = new Map();

if (redis) {
  redis.on('error', (err) => console.error('Redis Client Error:', err));
}

// ฟังก์ชันช่วยเชื่อมต่อ Redis อย่างปลอดภัย
async function getRedisClient() {
  if (!useRedis || !redis) return null;
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const KEY_PREFIX = 'letter:';

// 1. หน้าแรก
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. ดึงข้อมูลจดหมาย
app.get('/api/letters/:slug', async (req, res) => {
  try {
    if (useRedis) {
      const client = await getRedisClient();
      const rawData = await client.get(KEY_PREFIX + req.params.slug);
      if (!rawData) {
        return res.status(404).json({ error: 'Letter not found' });
      }
      const row = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      return res.json(row);
    }

    const rawData = fallbackStore.get(KEY_PREFIX + req.params.slug);
    if (!rawData) {
      return res.status(404).json({ error: 'Letter not found' });
    }
    res.json(JSON.parse(rawData));
  } catch (error) {
    console.error('Failed to load letter:', error);
    res.status(500).json({ error: 'Something went wrong loading this letter.' });
  }
});

// 3. บันทึกจดหมาย
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

    if (useRedis) {
      const client = await getRedisClient();
      await client.set(KEY_PREFIX + slug, JSON.stringify(letter));
    } else {
      fallbackStore.set(KEY_PREFIX + slug, JSON.stringify(letter));
      console.warn('Redis not configured: using in-memory fallback store for letters.');
    }

    res.json({ slug, shareUrl: `/letter/${slug}` });
  } catch (error) {
    console.error('Failed to save letter:', error);
    res.status(500).json({ error: 'Something went wrong saving this letter.' });
  }
});

// 4. หน้าดูจดหมาย
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