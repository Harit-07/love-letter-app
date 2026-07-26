let dynamicPhotos = [];   
let dynamicStickers = []; 
let currentCoverStyle = 'envelope';
let customCoverImage = '';
let currentCoverColor = '#ff5277';
let currentThemeColor = '#fdf2f4';
let isLetterUnlocked = false; // จำสถานะการปลดล็อกในแท็บนี้

// 1. หัวใจลอย (ปรับปรุงให้สร้าง Container อัตโนมัติหากไม่มี)
function createFloatingHearts() {
  let container = document.getElementById('floatingHeartsContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'floatingHeartsContainer';
    container.style.cssText = 'position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 1;';
    document.body.appendChild(container);
  }

  const emojis = ['💖', '💗', '✨', '🌸', '💕'];

  setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}vw;
      bottom: -40px;
      font-size: ${Math.random() * 12 + 16}px;
      animation: floatUpAnim ${Math.random() * 3 + 4}s linear infinite;
      z-index: 1;
      opacity: 0.8;
    `;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
  }, 600);
}

// ฉีด CSS Animation สำหรับหัวใจลอยเผื่อไว้ในระบบ
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes floatUpAnim {
    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
    20% { opacity: 0.8; }
    100% { transform: translateY(-105vh) rotate(360deg); opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);

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
      const recipientView = document.getElementById('recipientView');
      if (recipientView) recipientView.style.backgroundColor = currentThemeColor;
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
        const photoObj = {
          id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          type: 'photo',
          src: evt.target.result,
          frameStyle: frameStyleSelect.value || 'polaroid',
          xPct: 35,
          yPct: 35,
          widthPct: 30,
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
        xPct: 40,
        yPct: 40,
        widthPct: 15,
        rotation: (Math.random() * 20) - 10
      };

      dynamicStickers.push(stickerObj);
      renderInteractiveItem(stickerCanvas, stickerObj, true);
    });
  });
}

function renderInteractiveItem(canvas, itemData, isEditable = false) {
  if (!canvas) return;

  const renderIt = () => {
    const item = document.createElement('div');
    item.className = `interactive-item ${itemData.type === 'photo' ? 'frame-' + (itemData.frameStyle || 'polaroid') : 'item-sticker'}`;
    item.id = itemData.id;
    
    item.style.position = 'absolute';
    item.style.pointerEvents = isEditable ? 'auto' : 'none';

    let leftCss, topCss, widthCss;
    if (itemData.xPct !== undefined && itemData.yPct !== undefined) {
      leftCss = itemData.xPct + '%';
      topCss = itemData.yPct + '%';
      widthCss = itemData.widthPct + '%';
    } else if (itemData.xRatio !== undefined) {
      leftCss = (itemData.xRatio * 100) + '%';
      topCss = (itemData.yRatio * 100) + '%';
      widthCss = (itemData.widthRatio * 100) + '%';
    } else {
      leftCss = '35%';
      topCss = '35%';
      widthCss = '30%';
    }

    item.style.left = leftCss;
    item.style.top = topCss;
    item.style.width = widthCss;
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
      const updateFontSize = () => {
        item.style.fontSize = (item.offsetWidth * 0.8) + 'px';
      };
      setTimeout(updateFontSize, 10);
      if (window.ResizeObserver) {
        new ResizeObserver(updateFontSize).observe(item);
      }
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
  };

  if (canvas.clientWidth > 0 || (canvas.parentElement && canvas.parentElement.clientWidth > 0)) {
    renderIt();
  } else {
    setTimeout(renderIt, 50);
  }
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

  const updateRatios = () => {
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    if (canvasWidth > 0 && canvasHeight > 0) {
      const leftPx = el.offsetLeft;
      const topPx = el.offsetTop;
      const widthPx = el.offsetWidth;

      itemData.xPct = (leftPx / canvasWidth) * 100;
      itemData.yPct = (topPx / canvasHeight) * 100;
      itemData.widthPct = (widthPx / canvasWidth) * 100;

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
      updateRatios();
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

// 7. คลิกเปิด-ปิดจดหมายฝั่งตัวอย่าง
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
  let possibleIds = [targetId];
  if (targetId === 'recipientCoverTitle') {
    possibleIds = ['recipientCoverTitle', 'recipientCoverTitleText', 'recipientTitle', 'coverTitleText', 'recipientCoverTitleDisplay'];
  } else if (targetId === 'recipientCoverSubtext') {
    possibleIds = ['recipientCoverSubtext', 'recipientCoverSub', 'recipientSubtext', 'coverSubtext', 'recipientCoverSubtextDisplay'];
  } else if (targetId === 'recipientGreeting') {
    possibleIds = ['recipientGreeting', 'recipientGreetingText', 'previewGreeting', 'recipientGreetingDisplay'];
  } else if (targetId === 'recipientMessage') {
    possibleIds = ['recipientMessage', 'recipientMessageText', 'previewMessage', 'recipientMessageDisplay'];
  } else if (targetId === 'recipientSignature') {
    possibleIds = ['recipientSignature', 'recipientSignatureText', 'previewSignature', 'recipientSignatureDisplay'];
  }

  let el = null;
  for (let id of possibleIds) {
    el = document.getElementById(id);
    if (el) break;
  }

  if (!el) {
    if (targetId.includes('Title')) {
      el = document.querySelector('.cover-title, .recipient-title, h2, h3');
    } else if (targetId.includes('Subtext')) {
      el = document.querySelector('.cover-subtext, .recipient-subtext, p');
    }
  }

  if (!el) {
    const coverEl = document.getElementById('recipientCover') || document.querySelector('.recipient-cover') || document.querySelector('.cover-container') || document.getElementById('recipientStage');
    if (coverEl) {
      el = document.createElement('div');
      if (targetId.includes('Title')) {
        el.id = 'recipientCoverTitle';
        el.className = 'cover-title';
        el.style.cssText = 'font-size: 1.4rem; font-weight: bold; color: #ff5277; margin-top: 15px; text-align: center;';
      } else {
        el.id = 'recipientCoverSubtext';
        el.className = 'cover-subtext';
        el.style.cssText = 'font-size: 0.9rem; color: #666; margin-top: 5px; text-align: center;';
      }
      coverEl.appendChild(el);
    }
  }

  if (!el) return;

  const textVal = (config && typeof config === 'object') ? (config.text || '') : (config || '');
  if (textVal !== undefined) {
    el.textContent = textVal;
    el.style.display = 'block';
  }

  if (config && typeof config === 'object') {
    if (config.font) el.style.fontFamily = config.font;
    if (config.size) el.style.fontSize = config.size + 'px';
    el.style.fontWeight = config.bold ? 'bold' : 'normal';
    if (config.color) el.style.color = config.color;
  }
}

// 9. หน้าต่างกรอกรหัสผ่านแบบพรีเมียม
function showCustomPasscodeModal(correctPasscode, hint, onSuccess) {
  let modal = document.getElementById('customPasscodeModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'customPasscodeModal';
    modal.style.cssText = `
      position: fixed; inset: 0;
      background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
      z-index: 99999;
      display: flex; justify-content: center; align-items: center;
      font-family: 'Mali', cursive;
      padding: 20px;
    `;
    modal.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(15px);
        padding: 45px 35px;
        border-radius: 32px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
        width: 100%;
        max-width: 400px;
        text-align: center;
        border: 2px solid rgba(255, 255, 255, 0.9);
      ">
        <div style="font-size: 4rem; margin-bottom: 12px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));">🔐</div>
        <h2 style="margin: 0 0 10px 0; font-size: 1.6rem; color: #ff3366; font-weight: bold;">จดหมายฉบับนี้ถูกล็อกไว้</h2>
        <p style="font-size: 0.95rem; color: #666; margin: 0 0 22px 0; line-height: 1.5;">กรุณากรอกรหัสผ่านเพื่อเปิดอ่านความในใจจดหมายฉบับนี้ครับ ❤️</p>
        
        <div id="modalHintBox" style="display: none; background: #fff0f3; border: 1px dashed #ffb3c1; padding: 12px 16px; border-radius: 16px; margin-bottom: 22px; font-size: 0.9rem; color: #d63384; text-align: left;">
          💡 <strong>คำใบ้:</strong> <span id="modalHintText"></span>
        </div>

        <div style="margin-bottom: 22px;">
          <input type="password" id="modalPinInput" placeholder="🔑 ใส่รหัสผ่านที่นี่..." style="
            width: 100%;
            padding: 14px 20px;
            border: 2px solid #ffd1dc;
            border-radius: 18px;
            font-size: 1.05rem;
            text-align: center;
            outline: none;
            background: #fff;
            color: #333;
            box-sizing: border-box;
            box-shadow: inset 0 2px 6px rgba(0,0,0,0.03);
            transition: all 0.3s;
          " />
        </div>

        <button id="modalSubmitBtn" style="
          width: 100%;
          background: linear-gradient(135deg, #ff5277 0%, #ff3366 100%);
          color: white;
          border: none;
          padding: 14px 0;
          border-radius: 18px;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 8px 22px rgba(255, 82, 119, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        ">เปิดอ่านจดหมาย ✨</button>
      </div>
    `;
    document.body.appendChild(modal);

    const submitBtn = modal.querySelector('#modalSubmitBtn');
    const pinInput = modal.querySelector('#modalPinInput');

    pinInput.addEventListener('focus', () => {
      pinInput.style.borderColor = '#ff3366';
      pinInput.style.boxShadow = '0 0 12px rgba(255, 51, 102, 0.25)';
    });
    pinInput.addEventListener('blur', () => {
      pinInput.style.borderColor = '#ffd1dc';
      pinInput.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.03)';
    });

    const handleVerify = () => {
      const entered = pinInput.value.trim();
      if (entered === correctPasscode.trim()) {
        modal.style.display = 'none';
        pinInput.value = '';
        if (onSuccess) onSuccess();
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

  const hintBox = modal.querySelector('#modalHintBox');
  const hintText = modal.querySelector('#modalHintText');
  if (hint && hint.trim() !== '') {
    hintText.textContent = hint;
    hintBox.style.display = 'block';
  } else {
    hintBox.style.display = 'none';
  }

  modal.style.display = 'flex';
  modal.style.opacity = '1';
  modal.querySelector('#modalPinInput').focus();
}

// 10. หน้าผู้รับลิงก์ (แก้ไขการเปลี่ยนสีพื้นหลังให้ทำงานสมบูรณ์ทั้ง Body และ View)
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

    if (recipientView) {
      recipientView.style.opacity = '1';
      recipientView.style.display = 'flex';
    }

    try {
      const res = await fetch(`/api/letters/${slug}`);
      if (res.ok) {
        const data = await res.json();
        
        // กำหนดสีพื้นหลังให้เปลี่ยนทั้ง Body และ RecipientView
        if (data.themeColor) {
          document.body.style.backgroundColor = data.themeColor;
          if (recipientView) recipientView.style.backgroundColor = data.themeColor;
        }

        applyTextConfigToRecipient(data.coverTitle, 'recipientCoverTitle');
        applyTextConfigToRecipient(data.coverSubtext, 'recipientCoverSubtext');
        applyTextConfigToRecipient(data.greeting, 'recipientGreeting');
        applyTextConfigToRecipient(data.message, 'recipientMessage');
        applyTextConfigToRecipient(data.signature, 'recipientSignature');

        const coverStyle = data.coverStyle || 'envelope';
        const customImg = data.customCoverImage || '';
        const coverColor = data.coverColor || '#ff5277';

        updateCoverDisplay(coverStyle, customImg, 'recipientCoverGraphic', 'recipientCoverBadge', 'recipientCoverTitle', coverColor);

        if (recipientCover) {
          recipientCover.style.position = 'relative';
          recipientCover.style.width = '100%';
          recipientCover.style.maxWidth = '420px';
          recipientCover.style.aspectRatio = '3 / 4';
          recipientCover.style.margin = '0 auto';
        }

        if (recipientLetterBoard) {
          recipientLetterBoard.style.position = 'relative';
          recipientLetterBoard.style.width = '100%';
          recipientLetterBoard.style.maxWidth = '420px';
          recipientLetterBoard.style.aspectRatio = '3 / 4';
          recipientLetterBoard.style.margin = '0 auto';

          let rPhotosCanvas = document.getElementById('recipientPhotosCanvas');
          if (!rPhotosCanvas) {
            rPhotosCanvas = document.createElement('div');
            rPhotosCanvas.id = 'recipientPhotosCanvas';
            rPhotosCanvas.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 10; overflow: hidden;';
            recipientLetterBoard.appendChild(rPhotosCanvas);
          } else {
            rPhotosCanvas.innerHTML = '';
          }

          let rStickerCanvas = document.getElementById('recipientStickerCanvas');
          if (!rStickerCanvas) {
            rStickerCanvas = document.createElement('div');
            rStickerCanvas.id = 'recipientStickerCanvas';
            rStickerCanvas.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 20; overflow: hidden;';
            recipientLetterBoard.appendChild(rStickerCanvas);
          } else {
            rStickerCanvas.innerHTML = '';
          }

          if (data.photos && Array.isArray(data.photos)) {
            data.photos.forEach(p => renderInteractiveItem(rPhotosCanvas, p, false));
          }

          if (data.stickers && Array.isArray(data.stickers)) {
            data.stickers.forEach(s => renderInteractiveItem(rStickerCanvas, s, false));
          }
        }

        if (recipientStage) {
          recipientStage.classList.remove('open');
          recipientStage.classList.add('closed');
        }

        const openLetterAction = () => {
          if (recipientStage) {
            recipientStage.classList.add('open');
            recipientStage.classList.remove('closed');
          }
        };

        const closeLetterAction = () => {
          if (recipientStage) {
            recipientStage.classList.remove('open');
            recipientStage.classList.add('closed');
          }
        };

        if (data.passcode && data.passcode.trim() !== '' && !isLetterUnlocked) {
          showCustomPasscodeModal(data.passcode, data.passcodeHint, () => {
            isLetterUnlocked = true;
          });
        }

        if (recipientCover && recipientStage) {
          recipientCover.onclick = () => {
            if (data.passcode && data.passcode.trim() !== '' && !isLetterUnlocked) {
              showCustomPasscodeModal(data.passcode, data.passcodeHint, () => {
                isLetterUnlocked = true;
                openLetterAction();
              });
            } else {
              openLetterAction();
            }
          };
        }

        if (recipientLetterBoard && recipientStage) {
          recipientLetterBoard.onclick = (e) => {
            if (e.target === recipientLetterBoard || e.target.id === 'recipientPhotosCanvas' || e.target.id === 'recipientStickerCanvas') {
              closeLetterAction();
            }
          };
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