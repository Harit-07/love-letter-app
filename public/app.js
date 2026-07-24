const express = require('express');
const app = express();

// ต้องมี middleware ตัวนี้เพื่อให้อ่าน req.body แบบ JSON ได้ (รองรับไฟล์รูปภาพ base64 ขนาดใหญ่)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ตัวอย่างที่เก็บข้อมูลชั่วคราวแบบ In-Memory (หรือถ้าใช้ Redis / Database ให้ปรับตรงจุดบันทึกครับ)
const lettersDB = {};

// ==========================================
// 1. API สำหรับบันทึกจดหมาย (POST)
// ==========================================
app.post('/api/letters', async (req, res) => {
  try {
    console.log('📥 รับข้อมูลมาจาก Frontend:', req.body);

    const {
      coverStyle,
      customCoverImage,
      coverColor,
      themeColor,
      passcode,
      passcodeHint,
      textStyles,
      photos,
      stickers
    } = req.body;

    // สร้าง ID สุ่มแบบสั้น เช่น 'k9x2pL8' สำหรับใช้ใน URL
    const letterId = Math.random().toString(36).substring(2, 9);

    // รวบรวมข้อมูลทั้งหมดที่ส่งมาจาก app.js
    const newLetter = {
      id: letterId,
      coverStyle: coverStyle || 'envelope',
      customCoverImage: customCoverImage || '',
      coverColor: coverColor || '#ff5277',
      themeColor: themeColor || '#fdf2f4',
      passcode: passcode ? String(passcode).trim() : '',
      passcodeHint: passcodeHint ? String(passcodeHint).trim() : '',
      textStyles: textStyles || {},
      photos: Array.isArray(photos) ? photos : [],
      stickers: Array.isArray(stickers) ? stickers : [],
      createdAt: new Date().toISOString()
    };

    // 💾 บันทึกลง Database / Memory / Redis
    lettersDB[letterId] = newLetter;
    // หากใช้ Redis ให้ใช้: await redis.set(`letter:${letterId}`, JSON.stringify(newLetter));

    // ส่ง Response กลับไปให้ Frontend
    return res.status(200).json({
      success: true,
      id: letterId,
      shareUrl: `/letter/${letterId}`
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการบันทึก:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' 
    });
  }
});

// ==========================================
// 2. API สำหรับดึงข้อมูลจดหมายไปแสดงผล (GET)
// ==========================================
app.get('/api/letters/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // ดึงข้อมูลจาก Database / Memory / Redis
    const letter = lettersDB[id];
    // หากใช้ Redis ให้ใช้: const letter = JSON.parse(await redis.get(`letter:${id}`));

    if (!letter) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบจดหมายฉบับนี้' 
      });
    }

    // ส่งข้อมูลจดหมายกลับไปให้หน้าจดหมายของผู้รับ
    return res.status(200).json(letter);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' 
    });
  }
});