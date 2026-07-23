// ข้อมูลสำหรับเก็บ state ในหน้าสร้างจดหมาย
let currentTheme = 'pink';
let selectedStickers = [];
let uploadedPhotoBase64 = '';

// 1. ระบบแอนิเมชันหัวใจลอยพื้นหลัง
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

    setTimeout(() => {
      heart.remove();
    }, 7000);
  }, 500);
}

// 2. ระบบพรีวิวการพิมพ์แบบ Realtime
function setupRealtimePreview() {
  const greetingInput = document.getElementById('greetingInput');
  const messageInput = document.getElementById('messageInput');
  const signatureInput = document.getElementById('signatureInput');

  const previewGreeting = document.getElementById('previewGreeting');
  const previewMessage = document.getElementById('previewMessage');
  const previewSignature = document.getElementById('previewSignature');

  if (greetingInput && previewGreeting) {
    greetingInput.addEventListener('input', (e) => {
      previewGreeting.textContent = e.target.value || 'ถึงคนเก่งของเค้า~ 💖';
    });
  }

  if (messageInput && previewMessage) {
    messageInput.addEventListener('input', (e) => {
      previewMessage.textContent = e.target.value || 'ข้อความบอกรัก...';
    });
  }

  if (signatureInput && previewSignature) {
    signatureInput.addEventListener('input', (e) => {
      previewSignature.textContent = e.target.value || 'ด้วยรักและคิดถึงเสมอ';
    });
  }
}

// 3. ระบบเลือกธีม (Theme Picker)
function setupThemePicker() {
  const themeChips = document.querySelectorAll('.theme-chip');
  themeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      themeChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentTheme = chip.dataset.theme;
      document.body.className = `theme-${currentTheme}`;
    });
  });
}

// 4. ระบบเลือกสติกเกอร์ (Sticker Picker)
function setupStickerPicker() {
  const stickerChips = document.querySelectorAll('.sticker-chip');
  const stickerLayer = document.getElementById('stickerLayer');

  stickerChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const emoji = chip.dataset.sticker;
      if (selectedStickers.length >= 8) {
        alert('ใส่สติกเกอร์ได้สูงสุด 8 ตัวนะครับ');
        return;
      }
      selectedStickers.push(emoji);
      renderStickers(stickerLayer);
    });
  });
}

function renderStickers(layer) {
  if (!layer) return;
  layer.innerHTML = '';
  selectedStickers.forEach((emoji, index) => {
    const span = document.createElement('span');
    span.textContent = emoji;
    span.className = 'sticker-item';
    span.style.cursor = 'pointer';
    span.title = 'แตะเพื่อลบ';
    span.addEventListener('click', () => {
      selectedStickers.splice(index, 1);
      renderStickers(layer);
    });
    layer.appendChild(span);
  });
}

// 5. ระบบอัปโหลดรูปภาพ (Photo Memory)
function setupPhotoUpload() {
  const photoInput = document.getElementById('photoInput');
  const photoPreview = document.getElementById('photoPreview');
  const photoSlot = document.getElementById('photoSlot');

  if (!photoInput) return;

  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('รูปภาพขนาดใหญ่เกินไป (กรุณาใช้รูปไม่เกิน 3MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      uploadedPhotoBase64 = evt.target.result;
      const imgHtml = `<img src="${uploadedPhotoBase64}" style="max-width:100%; border-radius:12px; margin-top:10px;" />`;
      if (photoPreview) photoPreview.innerHTML = imgHtml;
      if (photoSlot) photoSlot.innerHTML = imgHtml;
    };
    reader.readAsDataURL(file);
  });
}

// 6. ปุ่มเปิดซองจดหมายฝั่งพรีวิว
function setupEnvelopeToggle() {
  const openButton = document.getElementById('openButton');
  const envelopeCard = document.getElementById('envelopeCard');

  if (openButton && envelopeCard) {
    openButton.addEventListener('click', () => {
      envelopeCard.classList.toggle('open');
      if (envelopeCard.classList.contains('open')) {
        openButton.textContent = 'ปิดซองจดหมาย ✉️';
      } else {
        openButton.textContent = 'แตะเพื่อเปิดซองจดหมาย 💌';
      }
    });
  }
}

// 7. ระบบสร้างจดหมาย & รับลิงก์ (Save & Copy Link)
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
            <div style="margin-top:15px; padding:12px; background:#e6fffa; border:1px solid #38b2ac; border-radius:10px; color:#234e52;">
              🎉 สร้างจดหมายเรียบร้อยแล้ว!<br>
              <strong>ลิงก์สำหรับส่งให้แฟน:</strong><br>
              <a href="${fullShareUrl}" target="_blank" style="color:#2b6cb0; word-break:break-all;">${fullShareUrl}</a>
            </div>
          `;
        }
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกจดหมาย กรุณาลองใหม่อีกครั้ง');
        saveBtn.disabled = false;
        saveBtn.textContent = '💌 สร้างจดหมาย & รับลิงก์ส่งแฟน';
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      saveBtn.disabled = false;
      saveBtn.textContent = '💌 สร้างจดหมาย & รับลิงก์ส่งแฟน';
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const url = copyBtn.dataset.url;
      if (url) {
        navigator.clipboard.writeText(url).then(() => {
          alert('คัดลอกลิงก์เรียบร้อยแล้ว! นำไปวางส่งในแชทให้แฟนได้เลย ❤️');
        });
      }
    });
  }
}

// 8. ตรวจสอบหากเป็นหน้าของ "ผู้รับ (แฟน)"
async function checkRecipientMode() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);

  if (match) {
    const slug = match[1];
    const editorPanel = document.getElementById('editorPanel');
    const previewPanel = document.getElementById('previewPanel');
    const recipientView = document.getElementById('recipientView');

    if (editorPanel) editorPanel.style.display = 'none';
    if (previewPanel) previewPanel.style.display = 'none';
    if (recipientView) recipientView.style.display = 'flex';

    try {
      const res = await fetch(`/api/letters/${slug}`);
      if (res.ok) {
        const data = await res.json();
        document.getElementById('recipientGreeting').textContent = data.greeting;
        document.getElementById('recipientMessage').textContent = data.message;
        document.getElementById('recipientSignature').textContent = data.signature;
        document.body.className = `theme-${data.theme || 'pink'}`;

        if (data.photo) {
          document.getElementById('recipientPhotoSlot').innerHTML = `<img src="${data.photo}" style="max-width:100%; border-radius:12px; margin-top:10px;" />`;
        }

        if (data.stickers && data.stickers.length > 0) {
          const recipientStickerLayer = document.getElementById('recipientStickerLayer');
          if (recipientStickerLayer) {
            recipientStickerLayer.innerHTML = data.stickers.map(s => `<span>${s}</span>`).join(' ');
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch letter:', e);
    }
  }
}

// ปุ่มเปิดซองจดหมายของแฟน
document.getElementById('recipientOpenBtn')?.addEventListener('click', function() {
  const envelope = document.getElementById('recipientEnvelope');
  if (envelope) envelope.classList.add('open');
  this.style.display = 'none';
});

// เริ่มต้นเรียกฟังก์ชันเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();
  setupRealtimePreview();
  setupThemePicker();
  setupStickerPicker();
  setupPhotoUpload();
  setupEnvelopeToggle();
  setupSaveButton();
  checkRecipientMode();
});