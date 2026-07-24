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

// 2. ระบบควบคุมและพรีวิวข้อความทุกจุดแบบ Realtime
function setupTextEditor(idPrefix, previewId) {
  const textInput = document.getElementById(idPrefix + 'Input');
  const fontSelect = document.getElementById(idPrefix + 'Font');
  const sizeInput = document.getElementById(idPrefix + 'Size');
  const boldBtn = document.getElementById(idPrefix + 'Bold');
  const colorPicker = document.getElementById(idPrefix + 'Color');
  const previewEl = document.getElementById(previewId);

  if (!textInput || !previewEl) return;

  const updateStyle = () => {
    previewEl.textContent = textInput.value;
    if (fontSelect) previewEl.style.fontFamily = fontSelect.value;
    if (sizeInput) previewEl.style.fontSize = sizeInput.value + 'px';
    if (boldBtn) {
      previewEl.style.fontWeight = boldBtn.classList.contains('active') ? 'bold' : 'normal';
    }
    if (colorPicker) previewEl.style.color = colorPicker.value;
  };

  textInput.addEventListener('input', updateStyle);
  if (fontSelect) fontSelect.addEventListener('change', updateStyle);
  if (sizeInput) sizeInput.addEventListener('input', updateStyle);
  if (colorPicker) colorPicker.addEventListener('input', updateStyle);
  
  if (boldBtn) {
    boldBtn.addEventListener('click', () => {
      boldBtn.classList.toggle('active');
      updateStyle();
    });
  }
}

function setupAllTextEditors() {
  setupTextEditor('coverTitle', 'coverTitleText');
  setupTextEditor('coverSubtext', 'coverSubtext');
  setupTextEditor('greeting', 'previewGreeting');
  setupTextEditor('message', 'previewMessage');
  setupTextEditor('signature', 'previewSignature');
}

function getTextConfig(idPrefix) {
  const textInput = document.getElementById(idPrefix + 'Input');
  const fontSelect = document.getElementById(idPrefix + 'Font');
  const sizeInput = document.getElementById(idPrefix + 'Size');
  const boldBtn = document.getElementById(idPrefix + 'Bold');
  const colorPicker = document.getElementById(idPrefix + 'Color');

  return {
    text: textInput ? textInput.value : '',
    font: fontSelect ? fontSelect.value : "'Mali', cursive",
    size: sizeInput ? sizeInput.value : '16',
    bold: boldBtn ? boldBtn.classList.contains('active') : false,
    color: colorPicker ? colorPicker.value : '#000000'
  };
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
  } else {
    if (badge) badge.style.display = 'block';
    graphic.classList.add(`${style}-style`);
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
        const canvasRect = canvas.getBoundingClientRect();
        const startX = canvasRect.width ? (canvasRect.width / 2 - 60) : 50;
        const startY = canvasRect.height ? (canvasRect.height / 2 - 60) : 50;

        const photoObj = {
          id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          type: 'photo',
          src: evt.target.result,
          frameStyle: frameStyleSelect.value || 'polaroid',
          x: canvasRect.width ? ((startX / canvasRect.width) * 100).toFixed(2) + '%' : '40%',
          y: canvasRect.height ? ((startY / canvasRect.height) * 100).toFixed(2) + '%' : '40%',
          width: '30%',
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
      const canvasRect = stickerCanvas.getBoundingClientRect();
      const startX = canvasRect.width ? (canvasRect.width / 2 - 25) : 50;
      const startY = canvasRect.height ? (canvasRect.height / 2 - 25) : 50;

      const stickerObj = {
        id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'sticker',
        emoji: emoji,
        x: canvasRect.width ? ((startX / canvasRect.width) * 100).toFixed(2) + '%' : '45%',
        y: canvasRect.height ? ((startY / canvasRect.height) * 100).toFixed(2) + '%' : '45%',
        width: '15%',
        rotation: (Math.random() * 20) - 10
      };

      dynamicStickers.push(stickerObj);
      renderInteractiveItem(stickerCanvas, stickerObj, true);
    });
  });
}

// เรนเดอร์ Element พร้อมปรับสัดส่วนขนาดสติ๊กเกอร์ให้แม่นยำ
function renderInteractiveItem(canvas, itemData, isEditable = false) {
  if (!canvas) return;

  const item = document.createElement('div');
  item.className = `interactive-item ${itemData.type === 'photo' ? 'frame-' + (itemData.frameStyle || 'polaroid') : 'item-sticker'}`;
  item.id = itemData.id;
  
  item.style.position = 'absolute';
  item.style.left = itemData.x;
  item.style.top = itemData.y;
  item.style.width = itemData.width;
  item.style.transform = `rotate(${itemData.rotation || 0}deg)`;
  item.style.zIndex = '50';

  if (itemData.type === 'photo') {
    const img = document.createElement('img');
    img.src = itemData.src;
    img.style.width = '100%';
    img.style.display = 'block';
    item.appendChild(img);
  } else {
    item.textContent = itemData.emoji;
    setTimeout(() => {
      if (item.offsetWidth) {
        item.style.fontSize = (item.offsetWidth * 0.8) + 'px';
      }
    }, 20);
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

    makeElementInteractive(item, itemData, handleResize, handleRotate, canvas);
  }

  canvas.appendChild(item);
}

function makeElementInteractive(el, itemData, resizeHandle, rotateHandle, canvas) {
  let isDragging = false, isResizing = false, isRotating = false;
  let startX, startY, startWidth, initialAngle;

  const getPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const updatePercentages = () => {
    const canvasRect = canvas.getBoundingClientRect();
    if (canvasRect.width > 0 && canvasRect.height > 0) {
      const leftPx = el.offsetLeft;
      const topPx = el.offsetTop;
      const widthPx = el.offsetWidth;

      itemData.x = ((leftPx / canvasRect.width) * 100).toFixed(2) + '%';
      itemData.y = ((topPx / canvasRect.height) * 100).toFixed(2) + '%';
      itemData.width = ((widthPx / canvasRect.width) * 100).toFixed(2) + '%';
      if (itemData.type === 'sticker') {
        el.style.fontSize = (widthPx * 0.8) + 'px';
      }
    }
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
      initialAngle = radians * (180 / Math.PI) - (itemData.rotation || 0);
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
    } else if (isResizing) {
      let newWidth = startWidth + (pos.clientX - startX);
      if (newWidth > 30 && newWidth < 350) {
        el.style.width = newWidth + 'px';
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
    if (isDragging || isResizing) {
      updatePercentages();
    }
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

// 7. คลิกเปิด-ปิดจดหมายฝั่งตัวอย่าง (Editor)
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
      coverTitle: getTextConfig('coverTitle'),
      coverSubtext: getTextConfig('coverSubtext'),
      greeting: getTextConfig('greeting'),
      message: getTextConfig('message'),
      signature: getTextConfig('signature'),
      coverStyle: currentCoverStyle,
      customCoverImage: customCoverImage,
      coverColor: currentCoverColor,
      themeColor: currentThemeColor,
      photos: dynamicPhotos,
      stickers: dynamicStickers,
      passcode: document.getElementById('passcodeInput')?.value || '',
      passcodeHint: document.getElementById('passcodeHintInput')?.value || ''
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

function applyTextConfigToRecipient(config, targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;

  if (config && typeof config === 'object') {
    el.textContent = config.text || '';
    if (config.font) el.style.fontFamily = config.font;
    if (config.size) el.style.fontSize = config.size + 'px';
    if (config.bold) {
      el.style.fontWeight = 'bold';
    } else {
      el.style.fontWeight = 'normal';
    }
    if (config.color) el.style.color = config.color;
  } else if (typeof config === 'string') {
    el.textContent = config;
  }
}

// 9. แสดงหน้าต่างกรอกรหัสผ่านแบบโมเดิร์น (สไตล์สวยงามตามที่ต้องการ)
function showCustomPasscodeModal(correctPasscode, hint, onSuccess) {
  let modal = document.getElementById('customPasscodeModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'customPasscodeModal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.4); z-index: 9999;
      display: flex; justify-content: center; align-items: center;
      font-family: 'Mali', cursive;
    `;
    modal.innerHTML = `
      <div style="background: #ff5277; padding: 30px 25px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 90%; max-width: 320px; text-align: center; color: white;">
        <h3 style="margin: 0 0 6px 0; font-size: 1.3rem;">กรอกรหัสผ่าน</h3>
        <p id="modalHint" style="font-size: 0.8rem; margin: 0 0 20px 0; opacity: 0.9;"></p>
        <input type="password" id="modalPinInput" placeholder="กรอกรหัสผ่านที่นี่" style="width: 85%; padding: 12px 15px; border: none; border-radius: 14px; font-size: 1rem; text-align: center; outline: none; margin-bottom: 20px; background: white; color: #333; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);" />
        <div>
          <button id="modalSubmitBtn" style="background: white; color: #ff5277; border: none; padding: 10px 28px; border-radius: 20px; font-weight: bold; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">ยืนยัน</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const submitBtn = modal.querySelector('#modalSubmitBtn');
    const pinInput = modal.querySelector('#modalPinInput');

    const handleVerify = () => {
      const entered = pinInput.value.trim();
      if (entered === correctPasscode.trim()) {
        modal.style.display = 'none';
        pinInput.value = '';
        onSuccess();
      } else {
        alert('❌ รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้งนะจ๊ะ!');
        pinInput.value = '';
        pinInput.focus();
      }
    };

    submitBtn.addEventListener('click', handleVerify);
    pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleVerify();
    });
  }

  const hintEl = modal.querySelector('#modalHint');
  hintEl.textContent = hint ? `คำใบ้ : ${hint}` : '';
  modal.style.display = 'flex';
  setTimeout(() => modal.querySelector('#modalPinInput').focus(), 100);
}

// 10. หน้าผู้รับลิงก์ (เช็ครหัสผ่านครั้งแรก + โหลดข้อมูล)
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

        applyTextConfigToRecipient(data.coverTitle, 'recipientCoverTitle');
        applyTextConfigToRecipient(data.coverSubtext, 'recipientCoverSubtext');
        applyTextConfigToRecipient(data.greeting, 'recipientGreeting');
        applyTextConfigToRecipient(data.message, 'recipientMessage');
        applyTextConfigToRecipient(data.signature, 'recipientSignature');

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

        // ระบบคลิกเปิดจดหมาย (เช็ครหัสผ่านเฉพาะครั้งแรกที่เปิด)
        const unlockedKey = 'unlocked_' + slug;
        if (recipientCover && recipientStage) {
          recipientCover.addEventListener('click', () => {
            const isUnlocked = localStorage.getItem(unlockedKey) === 'true';
            
            if (data.passcode && data.passcode.trim() !== '' && !isUnlocked) {
              showCustomPasscodeModal(data.passcode, data.passcodeHint, () => {
                localStorage.setItem(unlockedKey, 'true');
                recipientStage.classList.add('open');
                recipientStage.classList.remove('closed');
              });
            } else {
              recipientStage.classList.add('open');
              recipientStage.classList.remove('closed');
            }
          });
        }

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
  setupAllTextEditors();
  setupColorPickers();
  setupStyleSelector();
  setupMultiPhotoUpload();
  setupStickerPalette();
  setupEnvelopeToggle();
  setupSaveButton();
  checkRecipientMode();
});