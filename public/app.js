let currentTheme = 'pink';
let currentTemplate = 'envelope';
let selectedStickers = [];
let uploadedPhotoBase64 = '';

// ไอคอนและคำอธิบายสำหรับแต่ละ Template
const templateIcons = {
  envelope: { icon: '💌', text: 'ซองจดหมายรักฉบับลับส่งถึงคุณ~' },
  giftbox: { icon: '🎁', text: 'มีกล่องของขวัญเซอร์ไพรส์รอเปิดอยู่นะ!' },
  teddy: { icon: '🧸', text: 'เจ้าหมีน้อยมีความลับอยากบอกคุณ 💕' },
  starry: { icon: '✨', text: 'คำอธิษฐานใต้แสงดาวสำหรับคุณ...' }
};

// 1. หัวใจลอยพื้นหลัง
function createFloatingHearts() {
  const container = document.getElementById('floatingHeartsContainer');
  if (!container) return;
  const emojis = ['💖', '💗', '✨', '🌸', '🎁', '💕', '🧸'];

  setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    heart.style.fontSize = (Math.random() * 15 + 18) + 'px';
    container.appendChild(heart);

    setTimeout(() => heart.remove(), 7000);
  }, 500);
}

// 2. พรีวิวการพิมพ์แบบ Realtime
function setupRealtimePreview() {
  const greetingInput = document.getElementById('greetingInput');
  const messageInput = document.getElementById('messageInput');
  const signatureInput = document.getElementById('signatureInput');

  const previewGreeting = document.getElementById('previewGreeting');
  const previewMessage = document.getElementById('previewMessage');
  const previewSignature = document.getElementById('previewSignature');

  if (greetingInput && previewGreeting) {
    greetingInput.addEventListener('input', (e) => previewGreeting.textContent = e.target.value || 'ถึงคนเก่งของเค้า~ 💖');
  }
  if (messageInput && previewMessage) {
    messageInput.addEventListener('input', (e) => previewMessage.textContent = e.target.value || 'ข้อความบอกรัก...');
  }
  if (signatureInput && previewSignature) {
    signatureInput.addEventListener('input', (e) => previewSignature.textContent = e.target.value || 'ด้วยรักและคิดถึงเสมอ');
  }
}

// 3. ระบบเลือกธีม & Template
function setupThemePicker() {
  const themeChips = document.querySelectorAll('.theme-chip');
  const previewContainer = document.getElementById('previewContainer');
  const coverIcon = document.querySelector('#previewContainer .cover-icon');
  const coverText = document.querySelector('#previewContainer .cover-text');

  themeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      themeChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      currentTheme = chip.dataset.theme;
      currentTemplate = chip.dataset.template;

      // เปลี่ยนธีมพื้นหลัง
      document.body.className = `theme-${currentTheme}`;

      // เปลี่ยนไอคอนไอคอนปกพรีวิว
      if (templateIcons[currentTemplate]) {
        if (coverIcon) coverIcon.textContent = templateIcons[currentTemplate].icon;
        if (coverText) coverText.textContent = templateIcons[currentTemplate].text;
      }

      // รีเซ็ตสถานะเป็นปิดซอง/กล่องใหม่
      if (previewContainer) {
        previewContainer.classList.remove('open');
        previewContainer.classList.add('closed');
      }
    });
  });
}

// 4. สติกเกอร์
function setupStickerPicker() {
  const stickerChips = document.querySelectorAll('.sticker-chip');
  const previewStickerLayer = document.getElementById('previewStickerLayer');

  stickerChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      if (selectedStickers.length >= 6) {
        alert('เลือกสติกเกอร์ได้สูงสุด 6 ตัวครับ');
        return;
      }
      selectedStickers.push(chip.dataset.sticker);
      renderStickers(previewStickerLayer);
    });
  });
}

function renderStickers(container) {
  if (!container) return;
  container.innerHTML = '';
  selectedStickers.forEach((emoji, index) => {
    const span = document.createElement('span');
    span.textContent = emoji;
    span.style.cursor = 'pointer';
    span.title = 'แตะเพื่อลบ';
    span.addEventListener('click', () => {
      selectedStickers.splice(index, 1);
      renderStickers(container);
    });
    container.appendChild(span);
  });
}

// 5. อัปโหลดรูปภาพ
function setupPhotoUpload() {
  const photoInput = document.getElementById('photoInput');
  const previewPhotoSlot = document.getElementById('previewPhotoSlot');
  const uploadText = document.getElementById('uploadText');

  if (!photoInput) return;

  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('รูปภาพขนาดใหญ่เกินไป (ไม่เกิน 3MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      uploadedPhotoBase64 = evt.target.result;
      if (previewPhotoSlot) {
        previewPhotoSlot.innerHTML = `<img src="${uploadedPhotoBase64}" alt="Memory Photo" />`;
      }
      if (uploadText) uploadText.textContent = '✅ เลือกรูปภาพเรียบร้อย!';
    };
    reader.readAsDataURL(file);
  });
}

// 6. ปุ่มเปิด/ปิดการ์ด ( toggle open/close )
function setupOpenToggle() {
  const openPreviewBtn = document.getElementById('openPreviewBtn');
  const previewContainer = document.getElementById('previewContainer');

  if (openPreviewBtn && previewContainer) {
    openPreviewBtn.addEventListener('click', () => {
      previewContainer.classList.toggle('open');
      previewContainer.classList.toggle('closed');
    });
  }
}

// 7. บันทึกและรับลิงก์
function setupSaveButton() {
  const saveBtn = document.getElementById('saveButton');
  const copyBtn = document.getElementById('copyLinkButton');
  const statusBox = document.getElementById('statusBox');

  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ กำลังสร้างจดหมาย...';

    const payload = {
      greeting: document.getElementById('greetingInput')?.value || 'ถึงคนเก่งของเค้า~ 💖',
      message: document.getElementById('messageInput')?.value || '',
      signature: document.getElementById('signatureInput')?.value || '',
      theme: currentTheme,
      template: currentTemplate,
      stickers: selectedStickers,
      photo: uploadedPhotoBase64
    };

    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        const fullShareUrl = window.location.origin + data.shareUrl;
        saveBtn.textContent = '✨ สร้างสำเร็จเรียบร้อย!';
        if (copyBtn) {
          copyBtn.style.display = 'inline-block';
          copyBtn.dataset.url = fullShareUrl;
        }

        if (statusBox) {
          statusBox.innerHTML = `
            <div style="margin-top:15px; padding:12px; background:#e6fffa; border:1px solid #38b2ac; border-radius:12px; color:#234e52; font-size:0.85rem;">
              🎉 สร้างเรียบร้อยแล้ว!<br>
              <strong>ลิงก์สำหรับส่งให้แฟน:</strong><br>
              <a href="${fullShareUrl}" target="_blank" style="color:#2b6cb0; word-break:break-all;">${fullShareUrl}</a>
            </div>
          `;
        }
      } else {
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        saveBtn.disabled = false;
        saveBtn.textContent = '💖 สร้างจดหมาย & รับลิงก์ส่งแฟน';
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      saveBtn.disabled = false;
      saveBtn.textContent = '💖 สร้างจดหมาย & รับลิงก์ส่งแฟน';
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const url = copyBtn.dataset.url;
      if (url) {
        navigator.clipboard.writeText(url).then(() => {
          alert('คัดลอกลิงก์เรียบร้อยแล้ว! นำไปส่งให้แฟนได้เลยครับ ❤️');
        });
      }
    });
  }
}

// 8. โหมดผู้รับ (แฟนเปิดดูผ่านลิงก์)
async function checkRecipientMode() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);

  if (match) {
    const slug = match[1];
    const mainApp = document.getElementById('mainApp');
    const recipientView = document.getElementById('recipientView');
    const recipientContainer = document.getElementById('recipientContainer');
    const recipientCoverIcon = document.getElementById('recipientCoverIcon');
    const recipientOpenBtn = document.getElementById('recipientOpenBtn');

    if (mainApp) mainApp.style.display = 'none';
    if (recipientView) recipientView.style.display = 'flex';

    try {
      const res = await fetch(`/api/letters/${slug}`);
      if (res.ok) {
        const data = await res.json();
        
        document.getElementById('recipientGreeting').textContent = data.greeting;
        document.getElementById('recipientMessage').textContent = data.message;
        document.getElementById('recipientSignature').textContent = data.signature;

        // สลับธีมให้ตรงกับที่คนสร้างเลือก
        const theme = data.theme || 'pink';
        const template = data.template || 'envelope';
        document.body.className = `theme-${theme}`;

        if (templateIcons[template] && recipientCoverIcon) {
          recipientCoverIcon.textContent = templateIcons[template].icon;
        }

        if (data.photo) {
          document.getElementById('recipientPhotoSlot').innerHTML = `<img src="${data.photo}" alt="Memory" />`;
        }

        if (data.stickers && data.stickers.length > 0) {
          document.getElementById('recipientStickerLayer').innerHTML = data.stickers.map(s => `<span>${s}</span>`).join(' ');
        }

        // ปุ่มกดเปิดสำหรับผู้รับ
        if (recipientOpenBtn && recipientContainer) {
          recipientOpenBtn.addEventListener('click', () => {
            recipientContainer.classList.remove('closed');
            recipientContainer.classList.add('open');
          });
        }
      }
    } catch (e) {
      console.error('Error loading recipient view:', e);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();
  setupRealtimePreview();
  setupThemePicker();
  setupStickerPicker();
  setupPhotoUpload();
  setupOpenToggle();
  setupSaveButton();
  checkRecipientMode();
});