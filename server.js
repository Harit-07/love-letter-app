const express = require('express');
const app = express();
const path = require('path');

// รองรับ Base64 ขนาดใหญ่
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Database จำลอง
const lettersDb = {};

// =========================
// บันทึกจดหมาย
// =========================
app.post('/api/letters', (req, res) => {

  const {
    coverTitle,
    coverSubtext,

    greeting,
    message,
    signature,

    coverStyle,
    customCoverImage,

    coverColor,
    themeColor,

    photos,
    stickers,

    passcode,
    passcodeHint
  } = req.body;

  const id =
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 7);

  lettersDb[id] = {

    // ✅ เพิ่มสองตัวนี้
    coverTitle,
    coverSubtext,

    greeting,
    message,
    signature,

    coverStyle,
    customCoverImage,

    coverColor: coverColor || '#ff5277',
    themeColor: themeColor || '#fdf2f4',

    photos: photos || [],
    stickers: stickers || [],

    passcode: passcode || '',
    passcodeHint: passcodeHint || ''
  };

  res.json({
    success: true,
    shareUrl: `/letter/${id}`
  });

});

// =========================
// ดึงข้อมูลจดหมาย
// =========================
app.get('/api/letters/:id', (req, res) => {

  const letter = lettersDb[req.params.id];

  if (!letter) {
    return res.status(404).json({
      error: 'ไม่พบข้อมูลจดหมาย'
    });
  }

  res.json(letter);

});

// =========================
// เปิดหน้าผู้รับ
// =========================
app.get('/letter/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});