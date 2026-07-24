let dynamicPhotos = [];   
let dynamicStickers = []; 
let currentCoverStyle = 'envelope';
let customCoverImage = '';
let currentCoverColor = '#ff5277';
let currentThemeColor = '#fdf2f4';

// 1. หัวใจและอิโมจิลอยฟุ้งกระจาย (รวมน้องหมู 🐷 🐽 และสัตว์ต่างๆ)
function createFloatingHearts() {
  const container = document.getElementById('floatingHeartsContainer');
  if (!container) return;
  const emojis = ['💖', '💗', '💓', '💞', '💕', '✨', '🌸', '🌷', '💘', '💌', '🌟', '🥰', '🐷', '🐽', '🐗', '🐱', '🐶', '🐰', '🦊', '🐼', '🐥'];

  setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 2.5 + 3) + 's';
    heart.style.fontSize = (Math.random() * 16 + 18) + 'px';
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 5500);
  }, 300);
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

// 6. เพิ่มสติ๊กเกอร์ (รวมหมวดหมู่น้องหมูและสัตว์ต่างๆ)
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

// ฟังก์ชันดึงค่าสไตล์ข้อความ
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

// 8. บันทึกจดหมาย (รองรับระบบเลือกล็อกรหัสผ่าน 6 หลักและคำใบ้)
function setupSaveButton() {
  const saveBtn = document.getElementById('saveButton');

  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    const passcodeInput = document.getElementById('passcodeInput');
    const passcodeHintInput = document.getElementById('passcodeHintInput');

    const passcode = passcodeInput ? passcodeInput.value.trim() : '';
    const passcodeHint = passcodeHintInput ? passcodeHintInput.value.trim() : '';

    if (passcode && passcode.length !== 6) {
      alert('⚠️ กรุณากำหนดรหัสผ่านเป็นตัวเลข 6 หลัก หรือเว้นว่างไว้หากไม่ต้องการล็อกครับ');
      if (passcodeInput) passcodeInput.focus();
      return;
    }

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

// หน้าต่างแสดงผลลิงก์สำเร็จ
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

function applySavedStyle(previewEl, styleObj, defaultText) {
  if (!previewEl) return;
  if (styleObj) {
    previewEl.textContent = styleObj.text !== undefined ? styleObj.text : defaultText;
    if (styleObj.font) previewEl.style.fontFamily = styleObj.font;
    if (styleObj.size) previewEl.style.fontSize = styleObj.size + 'px';
    previewEl.style.fontWeight = styleObj.bold ? 'bold' : 'normal';
    if (styleObj.color) previewEl.style.color = styleObj.color;
  } else {
    previewEl.textContent = defaultText;
  }
}

// 9. หน้าผู้รับลิงก์ พร้อมระบบล็อกหน้าจดหมายด้วยรหัสผ่าน 6 หลัก & คำใบ้
async function checkRecipientMode() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);

  if (match) {
    const slug = match[1];
    const mainApp = document.getElementById('mainApp');
    const recipientView = document.getElementById('recipientView');

    if (mainApp) mainApp.style.display = 'none';

    try {
      const res = await fetch(`/api/letters/${slug}`);
      if (res.ok) {
        const data = await res.json();

        // ตรวจสอบว่ามีการตั้งรหัสผ่านหรือไม่
        if (data.passcode && data.passcode.length === 6) {
          showPasscodeLockScreen(data, recipientView);
        } else {
          renderLetterContent(data, recipientView);
        }
      }
    } catch (e) {
      console.error('Error:', e);
    }
  }
}

// ฟังก์ชันสร้างหน้าจอกรอกรหัสผ่านฝั่งผู้รับ
function showPasscodeLockScreen(data, recipientView) {
  if (!recipientView) return;
  recipientView.style.display = 'flex';
  recipientView.style.opacity = '1';
  recipientView.innerHTML = `
    <div style="
      background: #ffffff; padding: 35px 25px; border-radius: 24px; width: 90%; max-width: 400px;
      text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.15); font-family: 'Mali', cursive;
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    ">
      <div style="font-size: 50px; margin-bottom: 10px;">🔐</div>
      <h2 style="color: #ff5277; margin-bottom: 8px; font-size: 1.4rem;">จดหมายฉบับนี้ถูกล็อกไว้</h2>
      <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">กรุณากรอกรหัสผ่าน 6 หลักเพื่อเปิดอ่าน</p>

      ${data.passcodeHint ? `
        <div style="background: #fff5f7; border: 1px dashed #ffb6c1; padding: 10px; border-radius: 12px; margin-bottom: 15px; color: #d53f8c; font-size: 0.85rem;">
          💡 <strong>คำใบ้:</strong> ${data.passcodeHint}
        </div>
      ` : ''}

      <input type="password" id="enterPasscodeInput" maxlength="6" placeholder="------" style="
        width: 80%; padding: 12px; font-size: 1.5rem; text-align: center; letter-spacing: 8px;
        border: 2px solid #cbd5e0; border-radius: 12px; outline: none; margin-bottom: 20px;
        font-family: monospace;
      ">

      <button id="submitPasscodeBtn" style="
        width: 100%; background: linear-gradient(135deg, #ff5277, #ff758c); color: white; border: none;
        padding: 12px; border-radius: 12px; font-weight: bold; font-size: 1rem; cursor: pointer;
        box-shadow: 0 4px 15px rgba(255,82,119,0.4);
      ">🔓 เปิดจดหมาย</button>
      
      <div id="passcodeError" style="color: #e53e3e; font-size: 0.85rem; margin-top: 10px; display: none;">
        ❌ รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้งนะ
      </div>
    </div>
  `;

  const inputEl = document.getElementById('enterPasscodeInput');
  const btnEl = document.getElementById('submitPasscodeBtn');
  const errEl = document.getElementById('passcodeError');

  const verifyPasscode = () => {
    if (inputEl.value === data.passcode) {
      recipientView.innerHTML = ''; 
      renderLetterContent(data, recipientView); 
    } else {
      errEl.style.display = 'block';
      inputEl.value = '';
      inputEl.focus();
    }
  };

  btnEl.addEventListener('click', verifyPasscode);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyPasscode();
  });
  inputEl.focus();
}

// ฟังก์ชันเรนเดอร์เนื้อหาจดหมายปกติ
function renderLetterContent(data, recipientView) {
  if (data.themeColor) document.body.style.backgroundColor = data.themeColor;

  recipientView.style.display = 'block';
  recipientView.style.opacity = '1';

  recipientView.innerHTML = `
    <div id="recipientStage" class="scrapbook-stage closed">
      
      <div id="recipientCover" class="cover-center-wrapper">
        <div class="cover-icon-box">
          <div id="recipientCoverGraphic" class="cover-graphic envelope-style">
            <span class="cover-badge" id="recipientCoverBadge">💖</span>
            <div class="bear-ears" id="recipientBearEars"></div>
          </div>
        </div>
        <h3 id="recipientCoverTitle" class="cover-title"></h3>
        <p id="recipientCoverSubtext" class="cover-subtext"></p>
      </div>

      <div id="recipientLetterBoard" class="letter-board">
        <div id="recipientStickerCanvas" class="sticker-canvas"></div>
        <div id="recipientPhotosCanvas" class="photos-canvas"></div>

        <div class="main-card">
          <h3 id="recipientGreeting" class="handwritten-title"></h3>
          <p id="recipientMessage" class="handwritten-body"></p>
          <p id="recipientSignature" class="handwritten-sig"></p>
        </div>
      </div>

    </div>
  `;

  if (data.textStyles) {
    applySavedStyle(document.getElementById('recipientCoverTitle'), data.textStyles.coverTitle, 'มีความรักส่งถึงคุณ 💕');
    applySavedStyle(document.getElementById('recipientCoverSubtext'), data.textStyles.coverSubtext, 'แตะเพื่อเปิดดูเซอร์ไพรส์ ✨');
    applySavedStyle(document.getElementById('recipientGreeting'), data.textStyles.greeting, 'สวัสดีคุณคนสวย 💖');
    applySavedStyle(document.getElementById('recipientMessage'), data.textStyles.message, '');
    applySavedStyle(document.getElementById('recipientSignature'), data.textStyles.signature, 'ด้วยรักเสมอมา');
  }

  const coverStyle = data.coverStyle || 'envelope';
  const customImg = data.customCoverImage || '';
  const coverColor = data.coverColor || '#ff5277';
  updateCoverDisplay(coverStyle, customImg, 'recipientCoverGraphic', 'recipientCoverBadge', 'recipientCoverTitle', coverColor);

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

  if (recipientCover && recipientStage) {
    recipientCover.addEventListener('click', () => {
      recipientStage.classList.add('open');
      recipientStage.classList.remove('closed');
    });
  }

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