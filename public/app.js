let polaroidPhotos = ['', '', '', ''];

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

// 2. Realtime Preview พิมพ์ข้อความ
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

// 3. อัปโหลดรูปโพลารอยด์ 4 รูป
function setupPhotoUploads() {
  const inputs = document.querySelectorAll('.photo-input');
  inputs.forEach((input) => {
    input.addEventListener('change', (e) => {
      const idx = e.target.dataset.index;
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        polaroidPhotos[idx] = evt.target.result;
        const imgBox = document.getElementById(`pImg${idx}`);
        if (imgBox) imgBox.style.backgroundImage = `url(${evt.target.result})`;
      };
      reader.readAsDataURL(file);
    });
  });
}

// 4. คลิกเปิด/ปิดจดหมาย
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

// 5. บันทึกและคัดลอกลิงก์
function setupSaveButton() {
  const saveBtn = document.getElementById('saveButton');
  const copyBtn = document.getElementById('copyLinkButton');
  const statusBox = document.getElementById('statusBox');

  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ กำลังสร้างจดหมาย...';

    const payload = {
      greeting: document.getElementById('greetingInput')?.value || 'สวัสดีคุณคนสวย 💖',
      message: document.getElementById('messageInput')?.value || '',
      signature: document.getElementById('signatureInput')?.value || '',
      photos: polaroidPhotos
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
            <div style="margin-top:12px; padding:10px; background:#e6fffa; border:1px solid #38b2ac; border-radius:10px; color:#234e52; font-size:0.8rem;">
              🎉 บันทึกเรียบร้อย!<br>
              <strong>ลิงก์ส่งแฟน:</strong> <a href="${fullShareUrl}" target="_blank">${fullShareUrl}</a>
            </div>
          `;
        }
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก');
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
          alert('คัดลอกลิงก์เรียบร้อยแล้ว! วางส่งในแชตให้แฟนได้เลย ❤️');
        });
      }
    });
  }
}

// 6. โหมดแฟนเปิดดูผ่านลิงก์
async function checkRecipientMode() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);

  if (match) {
    const slug = match[1];
    const mainApp = document.getElementById('mainApp');
    const recipientView = document.getElementById('recipientView');
    const recipientStage = document.getElementById('recipientStage');
    const recipientCover = document.getElementById('recipientCover');

    if (mainApp) mainApp.style.display = 'none';
    if (recipientView) recipientView.style.display = 'flex';

    try {
      const res = await fetch(`/api/letters/${slug}`);
      if (res.ok) {
        const data = await res.json();
        
        document.getElementById('recipientGreeting').textContent = data.greeting;
        document.getElementById('recipientMessage').textContent = data.message;
        document.getElementById('recipientSignature').textContent = data.signature;

        if (data.photos && Array.isArray(data.photos)) {
          data.photos.forEach((src, idx) => {
            const box = document.getElementById(`rImg${idx}`);
            if (box && src) box.style.backgroundImage = `url(${src})`;
          });
        }

        if (recipientCover && recipientStage) {
          recipientCover.addEventListener('click', () => {
            recipientStage.classList.add('open');
            recipientStage.classList.remove('closed');
          });
        }
      }
    } catch (e) {
      console.error('Error:', e);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();
  setupRealtimePreview();
  setupPhotoUploads();
  setupEnvelopeToggle();
  setupSaveButton();
  checkRecipientMode();
});