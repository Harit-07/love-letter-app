const express = require('express');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const port = process.env.PORT || 3000;

const db = new DatabaseSync(path.join(__dirname, 'letters.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    greeting TEXT NOT NULL,
    message TEXT NOT NULL,
    signature TEXT NOT NULL,
    theme TEXT NOT NULL,
    stickers TEXT NOT NULL,
    photo TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

app.get('/api/letters/:slug', (req, res) => {
  const stmt = db.prepare('SELECT * FROM letters WHERE slug = ?');
  const row = stmt.get(req.params.slug);
  if (!row) {
    return res.status(404).json({ error: 'Letter not found' });
  }
  res.json({
    slug: row.slug,
    greeting: row.greeting,
    message: row.message,
    signature: row.signature,
    theme: row.theme,
    stickers: JSON.parse(row.stickers),
    photo: row.photo || ''
  });
});

app.post('/api/letters', (req, res) => {
  const { greeting, message, signature, theme, stickers, photo } = req.body;
  const slug = generateSlug();

  const stmt = db.prepare(`
    INSERT INTO letters (slug, greeting, message, signature, theme, stickers, photo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    slug,
    greeting,
    message,
    signature,
    theme,
    JSON.stringify(stickers || []),
    photo || ''
  );

  res.json({ slug, shareUrl: `/letter/${slug}` });
});

app.get('/letter/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
