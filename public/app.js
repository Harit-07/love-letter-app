let polaroidPhotos = ['', '', '', ''];
let placedStickers = [];
let currentCoverStyle = 'envelope';

// 1. หัวใจลอยพื้นหลัง
function createFloatingHearts() {
  const container = document.getElementById('floatingHeartsContainer');
  if (!container) return;
  const emojis = ['💖', '💗', '✨', '🌸', '💕'];

  setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    heart.style.fontSize = (Math.random() * 12 + 16) + 'px';
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 6000);
  }, 600);
}

// 2. พรีวิวข้อความ Realtime
function setupRealtimePreview() {
  const greetingInput = document.getElementById('greetingInput');
  const messageInput = document.getElementById('messageInput');
  const signatureInput = document.getElementById('signatureInput');

  const previewGreeting = document.getElementById('previewGreeting');
  const previewMessage = document.getElementById('previewMessage');
  const previewSignature = document.getElementById('previewSignature');

  if (greetingInput) greetingInput.addEventListener('input', (e) => previewGreeting.textContent = e.target.value || 'สวัสดีคุณคนสวย 💖');
  if (messageInput) messageInput.addEventListener('input', (e) => previewMessage.textContent = e.target.value || 'ข้อความบอกรัก...');
  if (signatureInput) signatureInput.addEventListener('input', (e) => previewSignature.textContent = e.target.value || 'ด้วยรักเสมอมา');
}

// 3. สลับรูปแบบปกก่อนเปิด (ซอง / กล่อง / หมี)
function setupStyleSelector() {
  const styleBtns = document.querySelectorAll('.style-btn');
  const previewContainer = document.getElementById('previewContainer');
  const coverGraphic = document.getElementById('coverGraphic');
  const coverTitleText = document.getElementById('coverTitleText');

  styleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      styleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      currentCoverStyle = btn.dataset.style;
      
      if (coverGraphic) {
        coverGraphic.className = `cover-graphic ${currentCoverStyle}-style`;
      }

      if (coverTitleText) {
        if (currentCoverStyle === 'envelope') coverTitleText.textContent = 'คุณมีจดหมายรักฉบับใหม่ 💌';
        if (currentCoverStyle === 'giftbox') coverTitleText.textContent = 'มีกล่องของขวัญเซอร์ไพรส์รออยู่ 🎁';
        if (currentCoverStyle === 'bear') coverTitleText.textContent = 'เจ้าหมีน้อยนำความรักมาส่ง 🧸';
      }

      // รีเซ็ตให้กลับมาปิด
      if (previewContainer) {
        previewContainer.classList.remove('open');
        previewContainer.classList.add('closed');
      }
    });
  });
}

// 4. อัปโหลดรูปภาพโพลารอยด์ทั้ง 4 ช่อง
function setupPhotoUploads() {
  const inputs = document.querySelectorAll('.photo-input');
  
  inputs.forEach((input) => {
    input.addEventListener('change', (e) => {
      const idx = e.target.dataset.index;
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64Img = evt.target.result;
        polaroidPhotos[idx] = base64Img;

        // อัปเดตพื้นหลังในกรอบโพลารอยด์
        const imgBox = document.getElementById(`pImg${idx}`);
        if (imgBox) {
          imgBox.style.backgroundImage = `url(${base64Img})`;
        }

        // เปลี่ยนข้อความในปุ่มอัปโหลด
        const label = document.getElementById(`labelP${idx}`);
        if (label) label.textContent = `✅ รูปที่ ${parseInt(idx) + 1}`;
      };
      reader.readAsDataURL(file);
    });
  });
}

// 5. ระบบแปะและลากสติกเกอร์
function setupStickerPalette() {
  const stickerBtns = document.querySelectorAll('.sticker-add-btn');
  const stickerCanvas = document.getElementById('stickerCanvas');

  stickerBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji;
      const id = 'stk_' + Date.now();
      const left = Math.random() * 60 + 20; // %
      const top = Math.random() * 60 + 20;  // %

      const stickerData = { id, emoji, left, top };
      placedStickers.push(stickerData);

      renderSingleSticker(stickerCanvas, stickerData);
    });
  });
}

function renderSingleSticker(canvas, sticker) {
  if (!canvas) return;
  const el = document.createElement('div');
  el.className = 'placed-sticker draggable-item';
  el.id = sticker.id;
  el.textContent = sticker.emoji;
  el.style.left = sticker.left + '%';
  el.style.top = sticker.top + '%';

  canvas.appendChild(el);
  makeDraggable(el);
}

// 6. ฟังก์ชันทำให้ Element สามารถ Drag & Drop (ลากขยับได้)
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  element.onmousedown = dragMouseDown;
  element.ontouchstart = dragTouchStart;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  function dragTouchStart(e) {
    const touch = e.touches[0];
    pos3 = touch.clientX;
    pos4 = touch.clientY;
    document.ontouchend = closeTouchDrag;
    document.ontouchmove = touchDrag;
  }

  function touchDrag(e) {
    const touch = e.touches[0];
    pos1 = pos3 - touch.clientX;
    pos2 = pos4 - touch.clientY;
    pos3 = touch.clientX;
    pos4 = touch.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeTouchDrag() {
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

function setupDraggables() {
  const draggables = document.querySelectorAll('.draggable-item');
  draggables.forEach((item) => makeDraggable(item));
}

// 7. คลิกเปิด/ปิดจดหมาย
function setupEnvelopeToggle() {
  const previewContainer = document.getElementById('previewContainer');
  const cover = document.getElementById('coverEnvelope');

  if (cover && previewContainer) {
    cover.addEventListener('click', () => {
      previewContainer.classList.add('open');
      previewContainer.classList.remove('closed');
    });
  }
}

// 8. บันทึกและรับลิงก์
function setupSaveButton() {
  const saveBtn = document.getElementById('saveButton');
  const copyBtn = document.getElementById('copyLinkButton');
  const statusBox = document.getElementById('statusBox');

  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ กำลังบันทึกจดหมาย...';

    const payload = {
      greeting: document.getElementById('greetingInput')?.value || 'สวัสดีคุณคนสวย 💖',
      message: document.getElementById('messageInput')?.value || '',
      signature: document.getElementById('signatureInput')?.value || '',
      coverStyle: currentCoverStyle,
      photos: polaroidPhotos,
      stickers: placedStickers
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
        saveBtn.textContent = '✨ บันทึกสำเร็จเรียบร้อย!';
        if (copyBtn) {
          copyBtn.style.display = 'inline-block';
          copyBtn.dataset.url = fullShareUrl;
        }

        if (statusBox) {
          statusBox.innerHTML = `
            <div style="margin-top:12px; padding:10px; background:#e6fffa; border:1px solid #38b2ac; border-radius:10px; color:#234e52; font-size:0.8rem;">
              🎉 บันทึกจดหมายเรียบร้อยแล้ว!<br>
              <strong>ลิงก์ส่งแฟน:</strong> <a href="${fullShareUrl}" target="_blank">${fullShareUrl}</a>
            </div>
          `;
        }
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        saveBtn.disabled = false;
        saveBtn.textContent = '💖 สร้างจดหมาย & รับลิงก์ส่งแฟน';
      }
    } catch (err) {
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
          alert('คัดลอกลิงก์เรียบร้อยแล้ว! นำไปส่งในแชตให้แฟนได้เลยครับ ❤️');
        });
      }
    });
  }
}

// 9. โหมดเปิดผ่านลิงก์ของผู้รับ (Recipient Mode)
async function checkRecipientMode() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);

  if (match) {
    const slug = match[1];
    const mainApp = document.getElementById('mainApp');
    const recipientView = document.getElementById('recipientView');
    const recipientStage = document.getElementById('recipientStage');
    const recipientCover = document.getElementById('recipientCover');
    const recipientCoverGraphic = document.getElementById('recipientCoverGraphic');

    if (mainApp) mainApp.style.display = 'none';
    if (recipientView) recipientView.style.display = 'flex';

    try {
      const res = await fetch(`/api/letters/${slug}`);
      if (res.ok) {
        const data = await res.json();
        
        document.getElementById('recipientGreeting').textContent = data.greeting;
        document.getElementById('recipientMessage').textContent = data.message;
        document.getElementById('recipientSignature').textContent = data.signature;

        const coverStyle = data.coverStyle || 'envelope';
        if (recipientCoverGraphic) {
          recipientCoverGraphic.className = `cover-graphic ${coverStyle}-style`;
        }

        if (data.photos && Array.isArray(data.photos)) {
          data.photos.forEach((src, idx) => {
            const box = document.getElementById(`rImg${idx}`);
            if (box && src) box.style.backgroundImage = `url(${src})`;
          });
        }

        if (data.stickers && Array.isArray(data.stickers)) {
          const rCanvas = document.getElementById('recipientStickerCanvas');
          data.stickers.forEach((s) => renderSingleSticker(rCanvas, s));
        }

        if (recipientCover && recipientStage) {
          recipientCover.addEventListener('click', () => {
            recipientStage.classList.add('open');
            recipientStage.classList.remove('closed');
          });
        }
      }
    } catch (e) {
      console.error('Error fetching letter data:', e);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();
  setupRealtimePreview();
  setupStyleSelector();
  setupPhotoUploads();
  setupStickerPalette();
  setupDraggables();
  setupEnvelopeToggle();
  setupSaveButton();
  checkRecipientMode();
});