let dynamicPhotos = [];   
let dynamicStickers = []; 
let currentCoverStyle = 'envelope';
let customCoverImage = '';
let currentCoverColor = '#ff5277';
let currentThemeColor = '#fdf2f4';

// 0. ฉีด CSS บังคับโครงสร้างการจัดวางให้ถูกต้อง 100% ป้องกันหน้าปกทับกับการ์ด
function injectRequiredStyles() {
  if (document.getElementById('letter-required-styles')) return;
  const style = document.createElement('style');
  style.id = 'letter-required-styles';
  style.textContent = `
    .scrapbook-stage {
      position: relative !important;
      width: 100% !important;
      max-width: 600px !important;
      height: 85vh !important;
      max-height: 700px !important;
      margin: 0 auto !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      box-sizing: border-box !important;
    }

    /* สถานะปิดซองจดหมาย */
    .scrapbook-stage.closed #recipientCover,
    .scrapbook-stage.closed #coverEnvelope {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      z-index: 100 !important;
      width: 100% !important;
      height: 100% !important;
    }

    .scrapbook-stage.closed #recipientLetterBoard,
    .scrapbook-stage.closed #letterBoard {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
      z-index: 1 !important;
    }

    /* สถานะเปิดจดหมาย */
    .scrapbook-stage.open #recipientCover,
    .scrapbook-stage.open #coverEnvelope {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
      z-index: 1 !important;
    }

    .scrapbook-stage.open #recipientLetterBoard,
    .scrapbook-stage.open #letterBoard {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      z-index: 100 !important;
      width: 100% !important;
      height: 100% !important;
    }

    .cover-center-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .cover-graphic {
      position: relative !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 180px;
      height: 130px;
      border-radius: 16px;
      margin-bottom: 15px;
    }

    .cover-badge {
      position: absolute !important;
      top: -10px !important;
      right: -10px !important;
      font-size: 28px !important;
      z-index: 10 !important;
    }

    .main-card {
      background: #ffffff !important;
      border-radius: 20px !important;
      padding: 30px 25px !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
      width: 85% !important;
      max-width: 420px !important;
      box-sizing: border-box !important;
      word-break: break-word !important;
      white-space: pre-wrap !important;
      z-index: 10 !important;
      text-align: center !important;
    }
  `;
  document.head.appendChild(style);
}

// 1. หัวใจและอิโมจิลอยฟุ้งกระจาย
function createFloatingHearts() {
  const container = document.getElementById('floatingHeartsContainer');
  if (!container) return;
  const emojis = ['💖', '💗', '💓', '💞', '💕', '✨', '🌸', '🌷', '💘', '💌', '🌟', '🥰', '🐷', '🐱', '🐰', '🐥'];

  setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 2.5 + 3) + 's';
    heart.style.fontSize = (Math.random() * 16 + 18) + 'px';
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 5500);
  }, 350);
}

function applyStyleToElement(previewEl, text, fontSel, sizeSel, boldBtn, colorSel, defaultText) {
  if (!previewEl) return;
  previewEl.textContent = (text !== undefined && text !== null && text.trim() !== '') ? text : defaultText;
  if (fontSel) previewEl.style.fontFamily = fontSel.value;
  if (sizeSel) previewEl.style.fontSize = sizeSel.value + 'px';
  if (boldBtn) {
    previewEl.style.fontWeight = boldBtn.classList.contains('active') ? 'bold' : 'normal';
  }
  if (colorSel) previewEl.style.color = colorSel.value;
}

// 2. พรีวิวข้อความ Realtime
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
      applyStyleToElement(preview, input ? input.value : '', font, size, bold, color, defaultText);
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

    update();
  };

  setupField('coverTitleInput', 'coverTitleFont', 'coverTitleSize', 'coverTitleBold', 'coverTitleColor', 'coverTitleText', 'มีความรักส่งถึงคุณ 💕');
  setupField('coverSubtextInput', 'coverSubtextFont', 'coverSubtextSize', 'coverSubtextBold', 'coverSubtextColor', 'coverSubtext', 'แตะเพื่อเปิดดูเซอร์ไพรส์ ✨');
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

function updateCoverDisplay(style, customImg, graphicId, badgeId, titleId, color, keepCustomTitle = false) {
  const graphic = document.getElementById(graphicId);
  const badge = document.getElementById(badgeId);
  const title = document.getElementById(titleId);

  if (!graphic) return;

  graphic.style.backgroundImage = '';
  graphic.className = 'cover-graphic';
  graphic.style.backgroundColor = color || '#ff5277';

  if (style === 'custom' && customImg) {
    graphic.style.backgroundImage = `url(${customImg})`;
    graphic.style.backgroundSize = 'cover';
    graphic.style.backgroundPosition = 'center';
    if (badge) badge.style.display = 'none';
    if (title && !keepCustomTitle) title.textContent = 'มีรูปภาพความทรงจำส่งถึงคุณ 📸';
  } else {
    if (badge) badge.style.display = 'block';
    graphic.classList.add(`${style}-style`);

    if (title && !keepCustomTitle) {
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
          x: 40 + Math.random() * 60,
          y: 40 + Math.random() * 60,
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
        x: 50 + Math.random() * 80,
        y: 50 + Math.random() * 80,
        width: 50,
        rotation: (Math.random() * 20) - 10
      };

      dynamicStickers.push(stickerObj);
      renderInteractiveItem(stickerCanvas, stickerObj, true);
    });
  });
}

function renderInteractiveItem(canvas, itemData, isEditable = false) {
  if (!canvas) return;

  const item = document.createElement('div');
  item.className = `interactive-item ${itemData.type === 'photo' ? 'frame-' + (itemData.frameStyle || 'polaroid') : 'item-sticker'}`;
  item.id = itemData.id;
  
  item.style.position = 'absolute';
  item.style.left = itemData.x + 'px';
  item.style.top = itemData.y + 'px';
  item.style.width = itemData.width + 'px';
  item.style.transform = `rotate(${itemData.rotation}deg)`;
  item.style.zIndex = '50';

  if (itemData.type === 'photo') {
    const img = document.createElement('img');
    img.src = itemData.src;
    img.style.width = '100%';
    img.style.display = 'block';
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

function makeElementInteractive(el, itemData, resizeHandle, rotateHandle) {
  let isDragging = false, isResizing = false, isRotating = false;
  let startX, startY, startWidth, initialAngle;

  const getPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handleStart = (e) => {
    e.stopPropagation();
    const pos = getPos(e);
    const target = e.target;

    if (target === resizeHandle) {
      isResizing = true;
      startX = pos.clientX;
      startWidth = el.offsetWidth;
    } else if (target === rotateHandle) {
      isRotating = true;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radians = Math.atan2(pos.clientY - centerY, pos.clientX - centerX);
      initialAngle = radians * (180 / Math.PI) - itemData.rotation;
    } else {
      isDragging = true;
      startX = pos.clientX - el.offsetLeft;
      startY = pos.clientY - el.offsetTop;
    }
  };

  const handleMove = (e) => {
    if (!isDragging && !isResizing && !isRotating) return;
    const pos = getPos(e);

    if (isDragging) {
      let newX = pos.clientX - startX;
      let newY = pos.clientY - startY;
      el.style.left = newX + 'px';
      el.style.top = newY + 'px';
      itemData.x = newX;
      itemData.y = newY;
    } else if (isResizing) {
      let newWidth = startWidth + (pos.clientX - startX);
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
      const radians = Math.atan2(pos.clientY - centerY, pos.clientX - centerX);
      let degree = radians * (180 / Math.PI) - initialAngle;

      el.style.transform = `rotate(${degree}deg)`;
      itemData.rotation = degree;
    }
  };

  const handleEnd = () => {
    isDragging = false;
    isResizing = false;
    isRotating = false;
  };

  el.addEventListener('mousedown', handleStart);
  el.addEventListener('touchstart', handleStart, { passive: false });

  document.addEventListener('mousemove', handleMove);
  document.addEventListener('touchmove', handleMove, { passive: false });

  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchend', handleEnd);
}

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

function setupSaveButton() {
  const saveBtn = document.getElementById('saveButton');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    const passcodeInput = document.getElementById('passcodeInput');
    const passcodeHintInput = document.getElementById('passcodeHintInput');

    const passcode = passcodeInput ? passcodeInput.value.trim() : '';
    const passcodeHint = passcodeHintInput ? passcodeHintInput.value.trim() : '';

    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ กำลังสร้างความหวาน...';

    const payload = {
      coverStyle: currentCoverStyle,
      customCoverImage: customCoverImage,
      coverColor: currentCoverColor,
      themeColor: currentThemeColor,
      passcode: passcode,
      passcodeHint: passcodeHint,
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
        showSuccessModal(fullShareUrl);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง');
        saveBtn.disabled = false;
        saveBtn.textContent = '💖 สร้างจดหมาย & รับลิงก์ส่งแฟน';
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      saveBtn.disabled = false;
      saveBtn.textContent = '💖 สร้างจดหมาย & รับลิงก์ส่งแฟน';
    }
  });
}

function showSuccessModal(url) {
  let modalOverlay = document.getElementById('successModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'successModalOverlay';
    modalOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px);
      display: flex; justify-content: center; align-items: center; z-index: 9999;
    `;
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div style="
      background: #ffffff; padding: 30px; border-radius: 24px; width: 90%; max-width: 480px;
      text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.2); font-family: 'Mali', cursive;
    ">
      <div style="font-size: 50px; margin-bottom: 10px;">🔒🎉</div>
      <h2 style="color: #ff5277; margin-bottom: 8px; font-size: 1.5rem;">สร้างจดหมายสำเร็จแล้ว!</h2>
      <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">คัดลอกลิงก์นี้ส่งให้คนพิเศษของคุณได้เลย ❤️</p>
      
      <div style="
        background: #fdf2f4; border: 2px dashed #ffb6c1; padding: 12px; border-radius: 12px;
        word-break: break-all; color: #333; font-size: 0.85rem; margin-bottom: 20px; user-select: all;
      ">
        ${url}
      </div>

      <div style="display: flex; gap: 10px; flex-direction: column;">
        <button id="modalCopyBtn" style="
          background: linear-gradient(135deg, #ff5277, #ff758c); color: white; border: none;
          padding: 12px; border-radius: 12px; font-weight: bold; font-size: 1rem; cursor: pointer;
          box-shadow: 0 4px 15px rgba(255,82,119,0.4);
        ">📋 คัดลอกลิงก์จดหมาย</button>
        
        <a href="${url}" target="_blank" style="
          background: #fff; color: #ff5277; border: 2px solid #ff5277; text-decoration: none;
          padding: 10px; border-radius: 12px; font-weight: bold; font-size: 0.95rem; display: block;
        ">👀 เปิดดูจดหมายของคุณ</a>
        
        <button id="modalCloseBtn" style="
          background: transparent; color: #888; border: none; padding: 8px; margin-top: 5px;
          font-size: 0.85rem; cursor: pointer;
        ">← กลับไปแก้ไขจดหมายต่อ</button>
      </div>
    </div>
  `;

  document.getElementById('modalCopyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('modalCopyBtn');
      btn.textContent = '✨ คัดลอกลิงก์สำเร็จแล้ว!';
      btn.style.background = '#38b2ac';
      setTimeout(() => {
        btn.textContent = '📋 คัดลอกลิงก์จดหมาย';
        btn.style.background = 'linear-gradient(135deg, #ff5277, #ff758c)';
      }, 2500);
    });
  });

  document.getElementById('modalCloseBtn').addEventListener('click', () => {
    modalOverlay.remove();
    const saveBtn = document.getElementById('saveButton');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💖 สร้างจดหมาย & รับลิงก์ส่งแฟน';
    }
  });
}

// 8. ฟังก์ชันช่วยดึงข้อความให้ยืดหยุ่น ป้องกันข้อความหาย
function extractTextConfig(data, key, defaultText) {
  if (data.textStyles && data.textStyles[key]) {
    const item = data.textStyles[key];
    if (typeof item === 'string') return { text: item || defaultText };
    if (typeof item === 'object') {
      return {
        text: (item.text !== undefined && item.text !== null && item.text !== '') ? item.text : defaultText,
        font: item.font,
        size: item.size,
        bold: item.bold,
        color: item.color
      };
    }
  }
  if (data[key] !== undefined && data[key] !== null) {
    if (typeof data[key] === 'string') return { text: data[key] || defaultText };
    if (typeof data[key] === 'object') {
      return {
        text: (data[key].text !== undefined && data[key].text !== null && data[key].text !== '') ? data[key].text : defaultText,
        font: data[key].font,
        size: data[key].size,
        bold: data[key].bold,
        color: data[key].color
      };
    }
  }
  return { text: defaultText };
}

function applySavedStyle(previewEl, config) {
  if (!previewEl || !config) return;
  previewEl.textContent = config.text || '';
  if (config.font) previewEl.style.fontFamily = config.font;
  if (config.size) previewEl.style.fontSize = config.size + 'px';
  previewEl.style.fontWeight = config.bold ? 'bold' : 'normal';
  if (config.color) previewEl.style.color = config.color;
}

// 9. ตรวจสอบโหมดผู้รับและแสดงผล
async function checkRecipientMode() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);

  if (match) {
    const slug = match[1];
    const mainApp = document.getElementById('mainApp');
    let recipientView = document.getElementById('recipientView');

    if (mainApp) mainApp.style.display = 'none';

    if (!recipientView) {
      recipientView = document.createElement('div');
      recipientView.id = 'recipientView';
      document.body.appendChild(recipientView);
    }

    recipientView.style.cssText = 'display:flex; justify-content:center; align-items:center; width:100vw; height:100vh; position:fixed; top:0; left:0; z-index:99999; overflow:hidden;';

    try {
      const res = await fetch(`/api/letters/${slug}`);
      if (res.ok) {
        const data = await res.json();
        renderLetterContent(data, recipientView);
      } else {
        recipientView.innerHTML = `<div style="text-align:center; font-family:'Mali',cursive; color:#ff5277; background:white; padding:30px; border-radius:20px;"><h2>❌ ไม่พบจดหมายฉบับนี้ หรือลิงก์อาจไม่ถูกต้อง</h2></div>`;
      }
    } catch (e) {
      console.error('Fetch Error:', e);
      recipientView.innerHTML = `<div style="text-align:center; font-family:'Mali',cursive; color:#ff5277; background:white; padding:30px; border-radius:20px;"><h2>⚠️ ไม่สามารถโหลดข้อมูลจดหมายได้</h2></div>`;
    }
  }
}

// 10. ป๊อบอัพกรอกรหัสผ่าน (รองรับรหัสผ่านทุกความยาว)
function showPasscodeModal(data, correctPasscode, onUnlocked) {
  let modal = document.getElementById('passcodeModalOverlay');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'passcodeModalOverlay';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px);
    display: flex; justify-content: center; align-items: center; z-index: 999999;
  `;

  const hintText = data.passcodeHint || data.hint || '';
  const codeLength = String(correctPasscode).trim().length || 4;

  let pinBoxesHtml = '';
  for (let i = 0; i < codeLength; i++) {
    pinBoxesHtml += `<div class="pin-box" style="width: 38px; height: 46px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; color: #ff5277; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.15);"></div>`;
  }

  modal.innerHTML = `
    <div style="
      background: #ff5277; padding: 35px 25px; border-radius: 28px; width: 88%; max-width: 380px;
      text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.3); font-family: 'Mali', cursive;
      color: white; position: relative; overflow: hidden;
    ">
      <div style="font-size: 45px; margin-bottom: 8px;">🔒💖</div>
      <h3 style="color: white; margin-bottom: 6px; font-size: 1.4rem; font-weight: bold;">กรอกรหัสผ่านเพื่อเปิดดูจดหมาย</h3>
      
      ${hintText ? `<p style="color: #ffe6eb; font-size: 0.85rem; margin-bottom: 20px;">💡 คำใบ้ : ${hintText}</p>` : '<div style="margin-bottom: 20px;"></div>'}

      <div style="position: relative; display: inline-block; width: 100%; margin-bottom: 20px;">
        <div style="display: flex; justify-content: center; gap: 8px;" id="pinBoxesContainer">
          ${pinBoxesHtml}
        </div>
        <input type="tel" id="realPinInput" pattern="[0-9]*" inputmode="numeric" maxlength="${codeLength}" style="
          position: absolute; top:0; left:0; width: 100%; height: 100%; opacity: 0.01; cursor: pointer; z-index: 10;
        " autofocus>
      </div>

      <button id="submitPasscodeBtn" style="
        width: 75%; background: white; color: #ff5277; border: none;
        padding: 11px; border-radius: 18px; font-weight: bold; font-size: 1.05rem; cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.15); transition: transform 0.2s;
      ">ปลดล็อกจดหมาย ✨</button>
      
      <div id="passcodeError" style="color: #ffffff; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 6px; font-size: 0.85rem; margin-top: 12px; display: none; font-weight: bold;">
        ❌ รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้งนะ
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const realInput = document.getElementById('realPinInput');
  const pinBoxes = modal.querySelectorAll('.pin-box');
  const errEl = document.getElementById('passcodeError');
  const submitBtn = document.getElementById('submitPasscodeBtn');

  setTimeout(() => realInput.focus(), 150);

  const checkCode = () => {
    const val = realInput.value.trim();
    if (val === String(correctPasscode).trim()) {
      modal.remove();
      if (typeof onUnlocked === 'function') onUnlocked();
    } else {
      errEl.style.display = 'block';
      realInput.value = '';
      pinBoxes.forEach(box => box.textContent = '');
      setTimeout(() => realInput.focus(), 150);
    }
  };

  realInput.addEventListener('input', () => {
    const val = realInput.value;
    pinBoxes.forEach((box, idx) => {
      box.textContent = val[idx] ? '●' : '';
    });
    if (val.length === codeLength) {
      checkCode();
    } else {
      errEl.style.display = 'none';
    }
  });

  submitBtn.addEventListener('click', checkCode);
}

// 11. ฟังก์ชันจัดหน้าจดหมายสำหรับผู้รับ
function renderLetterContent(data, recipientView) {
  if (data.themeColor) document.body.style.backgroundColor = data.themeColor;

  recipientView.innerHTML = `
    <div id="recipientStage" class="scrapbook-stage closed">
      <div id="recipientCover" class="cover-center-wrapper" style="cursor: pointer;">
        <div class="cover-graphic" id="recipientCoverGraphic">
          <span class="cover-badge" id="recipientCoverBadge">💖</span>
        </div>
        <h3 id="recipientCoverTitle" class="cover-title" style="margin-top:10px;"></h3>
        <p id="recipientCoverSubtext" class="cover-subtext" style="margin-top:5px; opacity:0.8;"></p>
      </div>

      <div id="recipientLetterBoard" class="letter-board">
        <div id="recipientStickerCanvas" class="sticker-canvas" style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;"></div>
        <div id="recipientPhotosCanvas" class="photos-canvas" style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5;"></div>

        <div class="main-card">
          <h3 id="recipientGreeting" style="margin-bottom: 12px;"></h3>
          <p id="recipientMessage" style="margin-bottom: 20px; line-height: 1.6;"></p>
          <p id="recipientSignature" style="text-align: right; opacity: 0.8;"></p>
        </div>
      </div>
    </div>
  `;

  // ดึงข้อความอย่างถูกต้อง ป้องกันข้อมูลตกหล่น
  applySavedStyle(document.getElementById('recipientCoverTitle'), extractTextConfig(data, 'coverTitle', 'มีความรักส่งถึงคุณ 💕'));
  applySavedStyle(document.getElementById('recipientCoverSubtext'), extractTextConfig(data, 'coverSubtext', 'แตะเพื่อเปิดดูเซอร์ไพรส์ ✨'));
  applySavedStyle(document.getElementById('recipientGreeting'), extractTextConfig(data, 'greeting', 'สวัสดีคุณคนสวย 💖'));
  applySavedStyle(document.getElementById('recipientMessage'), extractTextConfig(data, 'message', 'ข้อความบอกรัก...'));
  applySavedStyle(document.getElementById('recipientSignature'), extractTextConfig(data, 'signature', 'ด้วยรักเสมอมา'));

  const coverStyle = data.coverStyle || 'envelope';
  const customImg = data.customCoverImage || '';
  const coverColor = data.coverColor || '#ff5277';
  
  updateCoverDisplay(coverStyle, customImg, 'recipientCoverGraphic', 'recipientCoverBadge', 'recipientCoverTitle', coverColor, true);

  const rPhotosCanvas = document.getElementById('recipientPhotosCanvas');
  if (data.photos && Array.isArray(data.photos)) {
    data.photos.forEach(p => renderInteractiveItem(rPhotosCanvas, p, false));
  }

  const rStickerCanvas = document.getElementById('recipientStickerCanvas');
  if (data.stickers && Array.isArray(data.stickers)) {
    data.stickers.forEach(s => renderInteractiveItem(rStickerCanvas, s, false));
  }

  const recipientStage = document.getElementById('recipientStage');
  const recipientCover = document.getElementById('recipientCover');
  const recipientLetterBoard = document.getElementById('recipientLetterBoard');

  let isUnlocked = false;
  const rawPasscode = data.passcode || data.password || data.pin;
  const passcodeStr = rawPasscode !== undefined && rawPasscode !== null ? String(rawPasscode).trim() : '';

  if (recipientCover && recipientStage) {
    recipientCover.addEventListener('click', () => {
      // หากมีการตั้งรหัสผ่านไว้ จะแสดงหน้าปลดล็อกก่อนเสมอ
      if (passcodeStr !== '' && !isUnlocked) {
        showPasscodeModal(data, passcodeStr, () => {
          isUnlocked = true;
          recipientStage.classList.add('open');
          recipientStage.classList.remove('closed');
        });
      } else {
        recipientStage.classList.add('open');
        recipientStage.classList.remove('closed');
      }
    });
  }

  // แตะเพื่อพับเก็บซองจดหมาย
  if (recipientLetterBoard && recipientStage) {
    recipientLetterBoard.addEventListener('click', (e) => {
      if (e.target === recipientLetterBoard || e.target.id === 'recipientPhotosCanvas' || e.target.id === 'recipientStickerCanvas') {
        recipientStage.classList.remove('open');
        recipientStage.classList.add('closed');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  injectRequiredStyles();
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