const express = require('express');
const path = require('path');
const { createClient } = require('redis');

const app = express();
const port = process.env.PORT || 3000;

// ระบบสำรองในหน่วยความจำ (กรณีต่อ Redis ไม่ได้)
const memoryStore = new Map();

// ดึง Redis URL จาก Environment Variables
const redisUrl = process.env.STORAGE_URL || process.env.REDIS_URL || process.env.KV_URL;

let redisClient = null;
if (redisUrl && (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://'))) {
  redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (err) => console.error('Redis Client Error:', err.message));
}

// ฟังก์ชันดึง Client พร้อม Reconnect ปลอดภัย
async function getRedis() {
  if (!redisClient) return null;
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return redisClient;
  } catch (err) {
    console.error('Failed to connect Redis, using In-Memory store instead:', err.message);
    return null;
  }
}

app.use(express.json({ limit: '10mb' }));
const KEY_PREFIX = 'letter:';

// 1. หน้าแรก
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. API ดึงข้อมูลจดหมาย
app.get('/api/letters/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const client = await getRedis();
    let rawData = null;

    if (client) {
      rawData = await client.get(KEY_PREFIX + slug);
    } else {
      rawData = memoryStore.get(KEY_PREFIX + slug);
    }

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

// 3. API บันทึกจดหมาย (มีระบบป้องกัน Server Crash)
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

    const client = await getRedis();
    const jsonString = JSON.stringify(letter);

    if (client) {
      await client.set(KEY_PREFIX + slug, jsonString);
    } else {
      // เซฟลงหน่วยความจำชั่วคราวถ้าไม่ได้ต่อ Redis
      memoryStore.set(KEY_PREFIX + slug, jsonString);
    }

    res.json({ slug, shareUrl: `/letter/${slug}` });
  } catch (error) {
    console.error('Failed to save letter:', error);
    res.status(500).json({ error: 'Something went wrong saving this letter.' });
  }
});

// 4. หน้าเปิดดูจดหมายผ่านลิงก์
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