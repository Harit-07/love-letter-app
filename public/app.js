let dynamicPhotos = [];   // เก็บรูปภาพทั้งหมด
let dynamicStickers = []; // เก็บสติ๊กเกอร์ทั้งหมด
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

// 5. อัปโหลดรูปภาพ (Drag/Resize/Rotate)
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
          type: 'photo',
          src: evt.target.result,
          frameStyle: frameStyleSelect.value || 'polaroid',
          x: Math.random() * 80 + 20,
          y: Math.random() * 80 + 20,
          width: 110,
          rotation: (Math.random() * 20) - 10
        };

        dynamicPhotos.push(photoObj);
        renderInteractiveItem(canvas, photoObj, true);
      };
      reader.readAsDataURL(file);
    });
  });
}

// 6. เพิ่มสติ๊กเกอร์ (Drag/Resize/Rotate)
function setupStickerPalette() {
  const stickerBtns = document.querySelectorAll('.sticker-add-btn');
  const stickerCanvas = document.getElementById('stickerCanvas');

  stickerBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji;
      const stickerObj = {
        id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'sticker',
        emoji: emoji,
        x: Math.random() * 80 + 20,
        y: Math.random() * 80 + 20,
        width: 45,
        rotation: (Math.random() * 20) - 10
      };

      dynamicStickers.push(stickerObj);
      renderInteractiveItem(stickerCanvas, stickerObj, true);
    });
  });
}

// เรนเดอร์ Element ที่ขยับได้ (ทั้งรูปภาพและสติ๊กเกอร์)
function renderInteractiveItem(canvas, itemData, isEditable = false) {
  if (!canvas) return;

  const item = document.createElement('div');
  item.className = `interactive-item ${itemData.type === 'photo' ? 'frame-' + itemData.frameStyle : 'item-sticker'}`;
  item.id = itemData.id;
  item.style.left = itemData.x + 'px';
  item.style.top = itemData.y + 'px';
  item.style.width = itemData.width + 'px';
  item.style.transform = `rotate(${itemData.rotation}deg)`;

  if (itemData.type === 'photo') {
    const img = document.createElement('img');
    img.src = itemData.src;
    item.appendChild(img);
  } else {
    item.textContent = itemData.emoji;
    item.style.fontSize = (itemData.width * 0.8) + 'px'; // ปรับขนาดฟอนต์สติ๊กเกอร์ตามขนาด width
  }

  if (isEditable) {
    const controls = document.createElement('div');
    controls.className = 'item-controls';

    const btnDel = document.createElement('div');
    btnDel.className = 'btn-delete-item';
    btnDel.textContent = '✕';
    btnDel.onclick = (e) => {
      e.stopPropagation();
      if (itemData.type === 'photo') {
        dynamicPhotos = dynamicPhotos.filter(p => p.id !== itemData.id);
      } else {
        dynamicStickers = dynamicStickers.filter(s => s.id !== itemData.id);
      }
      item.remove();
    };

    const handleResize = document.createElement('div');
    handleResize.className = 'handle-resize';

    controls.appendChild(btnDel);
    controls.appendChild(handleResize);
    item.appendChild(controls);

    makeElementInteractive(item, itemData, handleResize);
  }

  canvas.appendChild(item);
}

function makeElementInteractive(el, itemData, resizeHandle) {
  let isDragging = false;
  let isResizing = false;
  let startX, startY, startWidth;

  el.addEventListener('mousedown', (e) => {
    e.stopPropagation(); // ป้องกันไม่ให้คลิกแล้วปิดจดหมาย
    if (e.target === resizeHandle) {
      isResizing = true;
      startX = e.clientX;
      startWidth = el.offsetWidth;
    } else {
      isDragging = true;
      startX = e.clientX - el.offsetLeft;
      startY = e.clientY - el.offsetTop;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      let newX = e.clientX - startX;
      let newY = e.clientY - startY;
      el.style.left = newX + 'px';
      el.style.top = newY + 'px';
      itemData.x = newX;
      itemData.y = newY;
    } else if (isResizing) {
      let newWidth = startWidth + (e.clientX - startX);
      if (newWidth > 25 && newWidth < 300) {
        el.style.width = newWidth + 'px';
        itemData.width = newWidth;
        if (itemData.type === 'sticker') {
          el.style.fontSize = (newWidth * 0.8) + 'px';
        }
      }
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
  });
}

// 7. คลิกเปิด-ปิดจดหมาย (กดที่หน้าปก = เปิด, กดที่จดหมาย = ปิด)
function setupEnvelopeToggle() {
  const previewContainer = document.getElementById('previewContainer');
  const cover = document.getElementById('coverEnvelope');
  const letterBoard = document.getElementById('letterBoard');

  if (cover && previewContainer) {
    cover.addEventListener('click', () => {
      previewContainer.classList.add('open');
      previewContainer.classList.remove('closed');
    });
  }

  if (letterBoard && previewContainer) {
    letterBoard.addEventListener('click', (e) => {
      // ถ้าไม่ได้กดที่การ์ด หรือองค์ประกอบย่อย ให้ปิดจดหมาย
      if (e.target === letterBoard || e.target.id === 'photosCanvas' || e.target.id === 'stickerCanvas') {
        previewContainer.classList.remove('open');
        previewContainer.classList.add('closed');
      }
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
      stickers: dynamicStickers
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

// 9. แสดงผลฝั่งผู้รับ (คลิกที่จดหมายเปิด-ปิดได้ ไม่มีปุ่มตัวหนังสือ)
async function checkRecipientMode() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);

  if (match) {
    const slug = match[1];
    const mainApp = document.getElementById('mainApp');
    const recipientView = document.getElementById('recipientView');
    const recipientStage = document.getElementById('recipientStage');
    const recipientCover = document.getElementById('recipientCover');
    const recipientLetterBoard = document.getElementById('recipientLetterBoard');

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

        // โหลดรูปภาพ
        const rPhotosCanvas = document.getElementById('recipientPhotosCanvas');
        if (data.photos && Array.isArray(data.photos)) {
          data.photos.forEach(p => renderInteractiveItem(rPhotosCanvas, p, false));
        }

        // โหลดสติ๊กเกอร์
        const rStickerCanvas = document.getElementById('recipientStickerCanvas');
        if (data.stickers && Array.isArray(data.stickers)) {
          data.stickers.forEach(s => renderInteractiveItem(rStickerCanvas, s, false));
        }

        // คลิกปกเพื่อเปิด
        if (recipientCover && recipientStage) {
          recipientCover.addEventListener('click', () => {
            recipientStage.classList.add('open');
            recipientStage.classList.remove('closed');
          });
        }

        // คลิกที่กระดานจดหมายเพื่อปิด
        if (recipientLetterBoard && recipientStage) {
          recipientLetterBoard.addEventListener('click', (e) => {
            recipientStage.classList.remove('open');
            recipientStage.classList.add('closed');
          });
        }

        // โหลดข้อมูลครบแล้วค่อยแสดงผล
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