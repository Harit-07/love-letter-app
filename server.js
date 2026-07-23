const express = require('express');
const app = express();
const path = require('path');

// 📌 สำคัญมาก: เพิ่ม limit เป็น 50mb เพื่อรองรับรูปภาพ Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// ในหน่วยความจำจำลอง (หรือ MongoDB/Database ของคุณ)
const lettersDb = {};

// API บันทึกข้อมูลจดหมาย
app.post('/api/letters', (req, res) => {
  const { greeting, message, signature, coverStyle, customCoverImage, coverColor, themeColor, photos, stickers } = req.body;
  
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  lettersDb[id] = {
    greeting,
    message,
    signature,
    coverStyle,
    customCoverImage,
    coverColor: coverColor || '#ff5277',
    themeColor: themeColor || '#fdf2f4',
    photos: photos || [],
    stickers: stickers || []
  };

  res.json({ success: true, shareUrl: `/letter/${id}` });
});

// API ดึงข้อมูลจดหมายสำหรับผู้รับ
app.get('/api/letters/:id', (req, res) => {
  const letter = lettersDb[req.params.id];
  if (letter) {
    res.json(letter);
  } else {
    res.status(404).json({ error: 'ไม่พบข้อมูลจดหมาย' });
  }
});

// เสิร์ฟหน้า SPA
app.get('/letter/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));