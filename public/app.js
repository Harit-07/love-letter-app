let dynamicPhotos = []; // เก็บอาร์เรย์รูปภาพทั้งหมด
let placedStickers = [];
let currentCoverStyle = 'envelope';
let customCoverImage = '';
let currentCoverColor = '#ff5277';
let currentThemeColor = '#fdf2f4';

// 1. หัวใจลอย
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

// 3. ปรับสีธีม & สีปก
function setupColorPickers() {
  const themePicker = document.getElementById('themeColorPicker');
  const coverPicker = document.getElementById('coverColorPicker');

  if (themePicker) {
    themePicker.addEventListener('input', (e) => {
      currentThemeColor = e.target.value;
      document.body.style.backgroundColor = currentThemeColor;
    });
  }

  if (coverPicker) {
    coverPicker.addEventListener('input', (e) => {
      currentCoverColor = e.target.value;
      updateCoverDisplay(currentCoverStyle, customCoverImage, 'coverGraphic', 'coverBadge', 'coverTitleText', currentCoverColor);
    });
  }
}

// 4. สไตล์ปก & อัปโหลดรูปปกเอง
function setupStyleSelector() {
  const styleBtns = document.querySelectorAll('.style-btn');
  const customCoverInput = document.getElementById('customCoverInput');

  styleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      styleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      currentCoverStyle = btn.dataset.style;
      customCoverImage = '';
      document.getElementById('customCoverLabel').textContent = '🖼️ หรืออัปโหลดรูปหน้าปกเอง (คลิก)';

      updateCoverDisplay(currentCoverStyle, '', 'coverGraphic', 'coverBadge', 'coverTitleText', currentCoverColor);
    });
  });

  if (customCoverInput) {
    customCoverInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        customCoverImage = evt.target.result;
        currentCoverStyle = 'custom';
        styleBtns.forEach((b) => b.classList.remove('active'));
        document.getElementById('customCoverLabel').textContent = '✅ เปลี่ยนรูปปกเรียบร้อย!';

        updateCoverDisplay('custom', customCoverImage, 'coverGraphic', 'coverBadge', 'coverTitleText', currentCoverColor);
      };
      reader.readAsDataURL(file);
    });
  }
}

function updateCoverDisplay(style, customImg, graphicId, badgeId, titleId, color) {
  const graphic = document.getElementById(graphicId);
  const badge = document.getElementById(badgeId);
  const title = document.getElementById(titleId);

  if (!graphic) return;

  graphic.style.backgroundImage = '';
  graphic.className = 'cover-graphic';
  graphic.style.backgroundColor = color || '#ff5277';

  if (style === 'custom' && customImg) {
    graphic.style.backgroundImage = `url(${customImg})`;
    if (badge) badge.style.display = 'none';
    if (title) title.textContent = 'มีรูปภาพความทรงจำส่งถึงคุณ 📸';
  } else {
    if (badge) badge.style.display = 'block';
    graphic.classList.add(`${style}-style`);

    if (title) {
      if (style === 'envelope') title.textContent = 'มีความรักส่งถึงคุณ 💕';
      if (style === 'giftbox') title.textContent = 'มีกล่องของขวัญรอเปิดอยู่ 🎁';
      if (style === 'bear') title.textContent = 'น้องหมีดุ๊กดิ๊กนำความรักมาส่ง 🧸';
    }
  }
}

// 5. อัปโหลดรูปภาพแบบไม่จำกัด & ระบบ Drag/Resize/Rotate
function setupMultiPhotoUpload() {
  const multiInput = document.getElementById('multiPhotoInput');
  const frameStyleSelect = document.getElementById('photoFrameStyleSelect');
  const canvas = document.getElementById('photosCanvas');

  if (!multiInput) return;

  multiInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const photoObj = {
          id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          src: evt.target.result,
          frameStyle: frameStyleSelect.value || 'polaroid',
          x: Math.random() * 80 + 20,
          y: Math.random() * 80 + 20,
          width: 110,
          rotation: (Math.random() * 20) - 10
        };

        dynamicPhotos.push(photoObj);
        renderInteractivePhoto(canvas, photoObj, true);
      };
      reader.readAsDataURL(file);
    });
  });
}

function renderInteractivePhoto(canvas, p, isEditable = false) {
  if (!canvas) return;

  const item = document.createElement('div');
  item.className = `interactive-photo-item frame-${p.frameStyle}`;
  item.id = p.id;
  item.style.left = p.x + 'px';
  item.style.top = p.y + 'px';
  item.style.width = p.width + 'px';
  item.style.transform = `rotate(${p.rotation}deg)`;

  const img = document.createElement('img');
  img.src = p.src;
  item.appendChild(img);

  if (isEditable) {
    const controls = document.createElement('div');
    controls.className = 'photo-controls';

    const btnDel = document.createElement('div');
    btnDel.className = 'btn-delete-photo';
    btnDel.textContent = '✕';
    btnDel.onclick = (e) => {
      e.stopPropagation();
      dynamicPhotos = dynamicPhotos.filter(photo => photo.id !== p.id);
      item.remove();
    };

    const handleResize = document.createElement('div');
    handleResize.className = 'handle-resize';

    controls.appendChild(btnDel);
    controls.appendChild(handleResize);
    item.appendChild(controls);

    // ระบบ Ldrag & Resize
    makeElementInteractive(item, p, handleResize);
  }

  canvas.appendChild(item);
}

function makeElementInteractive(el, photoData, resizeHandle) {
  let isDragging = false;
  let isResizing = false;
  let startX, startY, startWidth, startLeft, startTop;

  el.addEventListener('mousedown', (e) => {
    if (e.target === resizeHandle) {
      isResizing = true;
      startX = e.clientX;
      startWidth = el.offsetWidth;
    } else {
      isDragging = true;
      startX = e.clientX - el.offsetLeft;
      startY = e.clientY - el.offsetTop;
    }
    e.stopPropagation();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      let newX = e.clientX - startX;
      let newY = e.clientY - startY;
      el.style.left = newX + 'px';
      el.style.top = newY + 'px';
      photoData.x = newX;
      photoData.y = newY;
    } else if (isResizing) {
      let newWidth = startWidth + (e.clientX - startX);
      if (newWidth > 60 && newWidth < 300) {
        el.style.width = newWidth + 'px';
        photoData.width = newWidth;
      }
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
  });
}

// 6. สติกเกอร์
function setupStickerPalette() {
  const stickerBtns = document.querySelectorAll('.sticker-add-btn');
  const stickerCanvas = document.getElementById('stickerCanvas');

  stickerBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji;
      const stickerData = { emoji, left: Math.random() * 60 + 20, top: Math.random() * 60 + 20 };
      placedStickers.push(stickerData);
      renderSingleSticker(stickerCanvas, stickerData);
    });
  });
}

function renderSingleSticker(canvas, sticker) {
  if (!canvas) return;
  const el = document.createElement('div');
  el.className = 'placed-sticker';
  el.textContent = sticker.emoji;
  el.style.left = sticker.left + '%';
  el.style.top = sticker.top + '%';
  canvas.appendChild(el);
}

// 7. ปุ่มเปิด-ปิดจดหมาย
function setupEnvelopeToggle() {
  const previewContainer = document.getElementById('previewContainer');
  const cover = document.getElementById('coverEnvelope');
  const closeBtn = document.getElementById('closeLetterBtn');

  if (cover && previewContainer) {
    cover.addEventListener('click', () => {
      previewContainer.classList.add('open');
      previewContainer.classList.remove('closed');
    });
  }

  if (closeBtn && previewContainer) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      previewContainer.classList.remove('open');
      previewContainer.classList.add('closed');
    });
  }
}

// 8. บันทึกจดหมาย
function setupSaveButton() {
  const saveBtn = document.getElementById('saveButton');
  const copyBtn = document.getElementById('copyLinkButton');
  const statusBox = document.getElementById('statusBox');

  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ กำลังบันทึก...';

    const payload = {
      greeting: document.getElementById('greetingInput')?.value || 'สวัสดีคุณคนสวย 💖',
      message: document.getElementById('messageInput')?.value || '',
      signature: document.getElementById('signatureInput')?.value || '',
      coverStyle: currentCoverStyle,
      customCoverImage: customCoverImage,
      coverColor: currentCoverColor,
      themeColor: currentThemeColor,
      photos: dynamicPhotos,
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
        saveBtn.textContent = '✨ สำเร็จเรียบร้อย!';
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
          alert('คัดลอกลิงก์เรียบร้อยแล้ว! วางส่งในแชตได้เลยครับ ❤️');
        });
      }
    });
  }
}

// 9. แสดงผลให้ผู้รับ (ไม่มี Delay)
async function checkRecipientMode() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);

  if (match) {
    const slug = match[1];
    const mainApp = document.getElementById('mainApp');
    const recipientView = document.getElementById('recipientView');
    const recipientStage = document.getElementById('recipientStage');
    const recipientCover = document.getElementById('recipientCover');
    const recipientCloseBtn = document.getElementById('recipientCloseLetterBtn');

    if (mainApp) mainApp.style.display = 'none';

    try {
      const res = await fetch(`/api/letters/${slug}`);
      if (res.ok) {
        const data = await res.json();
        
        if (data.themeColor) document.body.style.backgroundColor = data.themeColor;

        document.getElementById('recipientGreeting').textContent = data.greeting;
        document.getElementById('recipientMessage').textContent = data.message;
        document.getElementById('recipientSignature').textContent = data.signature;

        const coverStyle = data.coverStyle || 'envelope';
        const customImg = data.customCoverImage || '';
        const coverColor = data.coverColor || '#ff5277';

        updateCoverDisplay(coverStyle, customImg, 'recipientCoverGraphic', 'recipientCoverBadge', 'recipientCoverTitle', coverColor);

        // โหลดรูปภาพความทรงจำ
        const rPhotosCanvas = document.getElementById('recipientPhotosCanvas');
        if (data.photos && Array.isArray(data.photos)) {
          data.photos.forEach(p => renderInteractivePhoto(rPhotosCanvas, p, false));
        }

        // โหลดสติกเกอร์
        if (data.stickers && Array.isArray(data.stickers)) {
          const rStickerCanvas = document.getElementById('recipientStickerCanvas');
          data.stickers.forEach((s) => renderSingleSticker(rStickerCanvas, s));
        }

        if (recipientCover && recipientStage) {
          recipientCover.addEventListener('click', () => {
            recipientStage.classList.add('open');
            recipientStage.classList.remove('closed');
          });
        }

        if (recipientCloseBtn && recipientStage) {
          recipientCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            recipientStage.classList.remove('open');
            recipientStage.classList.add('closed');
          });
        }

        // โหลดข้อมูลทุกอย่างพร้อมแล้ว ค่อยแสดงผล (ป้องกัน Delay)
        if (recipientView) {
          recipientView.style.display = 'flex';
          setTimeout(() => { recipientView.style.opacity = '1'; }, 50);
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
  setupColorPickers();
  setupStyleSelector();
  setupMultiPhotoUpload();
  setupStickerPalette();
  setupEnvelopeToggle();
  setupSaveButton();
  checkRecipientMode();
});