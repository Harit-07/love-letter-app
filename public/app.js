let dynamicPhotos = [];   
let dynamicStickers = []; 
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

// ฟังก์ชันช่วยเซ็ตสไตล์ข้อความ Realtime
function applyStyleToElement(previewEl, text, fontSel, sizeSel, boldBtn, colorSel, defaultText) {
  if (!previewEl) return;
  previewEl.textContent = text || defaultText;
  if (fontSel) previewEl.style.fontFamily = fontSel.value;
  if (sizeSel) previewEl.style.fontSize = sizeSel.value + 'px';
  if (boldBtn) {
    if (boldBtn.classList.contains('active')) {
      previewEl.style.fontWeight = 'bold';
    } else {
      previewEl.style.fontWeight = 'normal';
    }
  }
  if (colorSel) previewEl.style.color = colorSel.value;
}

// 2. พรีวิวข้อความ Realtime (รองรับ ฟอนต์, ขนาด, สี, ตัวหนา)
function setupRealtimePreview() {
  const setupField = (inputId, fontId, sizeId, boldId, colorId, previewId, defaultText) => {
    const input = document.getElementById(inputId);
    const font = document.getElementById(fontId);
    const size = document.getElementById(sizeId);
    const bold = document.getElementById(boldId);
    const color = document.getElementById(colorId);
    const preview = document.getElementById(previewId);

    if (!preview) return;

    const update = () => {
      applyStyleToElement(
        preview, 
        input ? input.value : '', 
        font, 
        size, 
        bold, 
        color, 
        defaultText
      );
    };

    if (input) input.addEventListener('input', update);
    if (font) font.addEventListener('change', update);
    if (size) size.addEventListener('input', update);
    if (color) color.addEventListener('input', update);
    if (bold) {
      bold.addEventListener('click', () => {
        bold.classList.toggle('active');
        update();
      });
    }

    // รันครั้งแรกเพื่อให้ค่าเริ่มต้นตรงกัน
    update();
  };

  setupField('coverTitleInput', 'coverTitleFont', 'coverTitleSize', 'coverTitleBold', 'coverTitleColor', 'coverTitleText', 'มีความรักส่งถึงคุณ 💕');
  setupField('coverSubtextInput', 'coverSubtextFont', 'coverSubtextSize', 'coverSubtextBold', 'coverSubtextColor', 'coverSubtext', '');
  setupField('greetingInput', 'greetingFont', 'greetingSize', 'greetingBold', 'greetingColor', 'previewGreeting', 'สวัสดีคุณคนสวย 💖');
  setupField('messageInput', 'messageFont', 'messageSize', 'messageBold', 'messageColor', 'previewMessage', 'ข้อความบอกรัก...');
  setupField('signatureInput', 'signatureFont', 'signatureSize', 'signatureBold', 'signatureColor', 'previewSignature', 'ด้วยรักเสมอมา');
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

// 4. สไตล์ปก
function setupStyleSelector() {
  const styleBtns = document.querySelectorAll('.style-btn');
  const customCoverInput = document.getElementById('customCoverInput');

  styleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      styleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      currentCoverStyle = btn.dataset.style;
      customCoverImage = '';
      const coverLabel = document.getElementById('customCoverLabel');
      if (coverLabel) coverLabel.textContent = '🖼️ หรืออัปโหลดรูปหน้าปกเอง (คลิก)';

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
        const coverLabel = document.getElementById('customCoverLabel');
        if (coverLabel) coverLabel.textContent = '✅ เปลี่ยนรูปปกเรียบร้อย!';

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

// 5. อัปโหลดรูปภาพ
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
          frameStyle: frameStyleSelect ? frameStyleSelect.value : 'polaroid',
          x: 50 + Math.random() * 80,
          y: 50 + Math.random() * 80,
          width: 120,
          rotation: (Math.random() * 20) - 10
        };

        dynamicPhotos.push(photoObj);
        renderInteractiveItem(canvas, photoObj, true);
      };
      reader.readAsDataURL(file);
    });
  });
}

// 6. เพิ่มสติ๊กเกอร์
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
        x: 60 + Math.random() * 100,
        y: 60 + Math.random() * 100,
        width: 50,
        rotation: (Math.random() * 20) - 10
      };

      dynamicStickers.push(stickerObj);
      renderInteractiveItem(stickerCanvas, stickerObj, true);
    });
  });
}

// เรนเดอร์ Element
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
    item.style.fontSize = (itemData.width * 0.8) + 'px';
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

    const handleRotate = document.createElement('div');
    handleRotate.className = 'handle-rotate';
    handleRotate.textContent = '🔄';

    controls.appendChild(btnDel);
    controls.appendChild(handleResize);
    controls.appendChild(handleRotate);
    item.appendChild(controls);

    makeElementInteractive(item, itemData, handleResize, handleRotate);
  }

  canvas.appendChild(item);
}

// ระบบขยับ Drag, ขยาย Resize, หมุน Rotate
function makeElementInteractive(el, itemData, resizeHandle, rotateHandle) {
  let isDragging = false;
  let isResizing = false;
  let isRotating = false;
  let startX, startY, startWidth, initialAngle;

  el.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    if (e.target === resizeHandle) {
      isResizing = true;
      startX = e.clientX;
      startWidth = el.offsetWidth;
    } else if (e.target === rotateHandle) {
      isRotating = true;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      initialAngle = radians * (180 / Math.PI) - itemData.rotation;
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
      if (newWidth > 30 && newWidth < 350) {
        el.style.width = newWidth + 'px';
        itemData.width = newWidth;
        if (itemData.type === 'sticker') {
          el.style.fontSize = (newWidth * 0.8) + 'px';
        }
      }
    } else if (isRotating) {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let degree = radians * (180 / Math.PI) - initialAngle;
      
      el.style.transform = `rotate(${degree}deg)`;
      itemData.rotation = degree;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
    isRotating = false;
  });
}

// 7. คลิกเปิด-ปิดจดหมาย
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
      if (e.target === letterBoard || e.target.id === 'photosCanvas' || e.target.id === 'stickerCanvas') {
        previewContainer.classList.remove('open');
        previewContainer.classList.add('closed');
      }
    });
  }
}

// ฟังก์ชันดึงค่าสไตล์ข้อความทั้งหมดไปเก็บบันทึก
function getTextConfig(inputId, fontId, sizeId, boldId, colorId) {
  const input = document.getElementById(inputId);
  const font = document.getElementById(fontId);
  const size = document.getElementById(sizeId);
  const bold = document.getElementById(boldId);
  const color = document.getElementById(colorId);

  return {
    text: input ? input.value : '',
    font: font ? font.value : "'Mali', cursive",
    size: size ? Number(size.value) : 16,
    bold: bold ? bold.classList.contains('active') : false,
    color: color ? color.value : '#000000'
  };
}

// 8. บันทึกจดหมาย (ส่งค่าสไตล์ครบถ้วนไปยัง Backend)
function setupSaveButton() {
  const saveBtn = document.getElementById('saveButton');
  const copyBtn = document.getElementById('copyLinkButton');
  const statusBox = document.getElementById('statusBox');

  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ กำลังบันทึก...';

    const payload = {
      coverStyle: currentCoverStyle,
      customCoverImage: customCoverImage,
      coverColor: currentCoverColor,
      themeColor: currentThemeColor,
      textStyles: {
        coverTitle: getTextConfig('coverTitleInput', 'coverTitleFont', 'coverTitleSize', 'coverTitleBold', 'coverTitleColor'),
        coverSubtext: getTextConfig('coverSubtextInput', 'coverSubtextFont', 'coverSubtextSize', 'coverSubtextBold', 'coverSubtextColor'),
        greeting: getTextConfig('greetingInput', 'greetingFont', 'greetingSize', 'greetingBold', 'greetingColor'),
        message: getTextConfig('messageInput', 'messageFont', 'messageSize', 'messageBold', 'messageColor'),
        signature: getTextConfig('signatureInput', 'signatureFont', 'signatureSize', 'signatureBold', 'signatureColor')
      },
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

// ฟังก์ชันช่วยแสดงผลฝั่งผู้รับตามสไตล์ที่บันทึกมา
function applySavedStyle(previewEl, styleObj, defaultText) {
  if (!previewEl) return;
  if (styleObj) {
    previewEl.textContent = styleObj.text || defaultText;
    if (styleObj.font) previewEl.style.fontFamily = styleObj.font;
    if (styleObj.size) previewEl.style.fontSize = styleObj.size + 'px';
    previewEl.style.fontWeight = styleObj.bold ? 'bold' : 'normal';
    if (styleObj.color) previewEl.style.color = styleObj.color;
  }
}

// 9. หน้าผู้รับลิงก์
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

        // รองรับทั้งโครงสร้างข้อมูลแบบใหม่ (textStyles) และแบบเก่า (แยกฟิลด์)
        if (data.textStyles) {
          applySavedStyle(document.getElementById('recipientCoverTitle'), data.textStyles.coverTitle, 'มีความรักส่งถึงคุณ 💕');
          applySavedStyle(document.getElementById('recipientCoverSubtext'), data.textStyles.coverSubtext, '');
          applySavedStyle(document.getElementById('recipientGreeting'), data.textStyles.greeting, 'สวัสดีคุณคนสวย 💖');
          applySavedStyle(document.getElementById('recipientMessage'), data.textStyles.message, '');
          applySavedStyle(document.getElementById('recipientSignature'), data.textStyles.signature, 'ด้วยรักเสมอมา');
        } else {
          // รองรับโค้ดรุ่นเก่าเผื่อจดหมายเก่า
          const setOld = (id, val, def) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val || def;
          };
          setOld('recipientCoverTitle', data.coverTitle, 'มีความรักส่งถึงคุณ 💕');
          setOld('recipientGreeting', data.greeting, 'สวัสดีคุณคนสวย 💖');
          setOld('recipientMessage', data.message, '');
          setOld('recipientSignature', data.signature, 'ด้วยรักเสมอมา');
        }

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

        // คลิกเปิด
        if (recipientCover && recipientStage) {
          recipientCover.addEventListener('click', () => {
            recipientStage.classList.add('open');
            recipientStage.classList.remove('closed');
          });
        }

        // คลิกจดหมายเพื่อปิด
        if (recipientLetterBoard && recipientStage) {
          recipientLetterBoard.addEventListener('click', () => {
            recipientStage.classList.remove('open');
            recipientStage.classList.add('closed');
          });
        }

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