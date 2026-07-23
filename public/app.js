// --- 1. ตัวแปรสถานะและค่าเริ่มต้น ---
let uploadedPhotos = []; 
let stickersList = [];   
let customCoverImg = null;

// --- 2. ฟังก์ชันช่วยจัดการสไตล์ข้อความ ---
function applyStyleToElem(elem, styleObj) {
  if (!elem || !styleObj) return;
  elem.innerText = styleObj.text || '';
  elem.style.fontFamily = styleObj.font || "'Mali', cursive";
  elem.style.fontSize = (styleObj.size || 16) + 'px';
  elem.style.fontWeight = styleObj.bold ? 'bold' : 'normal';
  elem.style.color = styleObj.color || '#000000';
}

// --- 3. ฟังก์ชันอัปเดตหน้าปก ---
function updateCoverDisplay(style, customImg, graphicId, badgeId, color) {
  const graphic = document.getElementById(graphicId);
  const badge = document.getElementById(badgeId);
  if (!graphic) return;

  graphic.className = 'cover-graphic';
  
  if (customImg) {
    graphic.classList.add('custom-image-style');
    graphic.style.backgroundImage = `url('${customImg}')`;
    graphic.style.backgroundColor = 'transparent';
    if (badge) badge.style.display = 'none';
  } else {
    graphic.style.backgroundImage = 'none';
    graphic.style.backgroundColor = color || '#ff5277';
    if (badge) badge.style.display = 'flex';

    if (style === 'envelope') {
      graphic.classList.add('envelope-style');
      if (badge) badge.innerText = '💌';
    } else if (style === 'giftbox') {
      graphic.classList.add('giftbox-style');
      if (badge) badge.innerText = '🎁';
    } else if (style === 'bear') {
      graphic.classList.add('bear-style');
      if (badge) badge.innerText = '🧸';
    }
  }
}

// --- 4. ระบบ Interactive สร้างไอเทมลากวาง และย่อ/ขยายได้ ---
function renderInteractiveItem(container, itemData, isEditable = true) {
  const div = document.createElement('div');
  div.className = 'interactive-item ' + (itemData.type === 'sticker' ? 'sticker-item' : 'photo-item');
  div.style.left = (itemData.x || 20) + 'px';
  div.style.top = (itemData.y || 20) + 'px';
  div.style.transform = `rotate(${itemData.rotate || 0}deg) scale(${itemData.scale || 1})`;

  if (itemData.type === 'sticker') {
    div.innerText = itemData.content;
    div.style.fontSize = '36px';
  } else {
    const img = document.createElement('img');
    img.src = itemData.content;
    
    const frameStyle = document.getElementById('photoFrameStyleSelect')?.value || 'polaroid';
    div.classList.add('frame-' + frameStyle);
    div.appendChild(img);
  }

  if (isEditable) {
    let isDragging = false;
    let startX, startY;

    div.addEventListener('mousedown', (e) => {
      // ถ้ากดที่ปุ่มย่อขยาย ไม่ต้องลากย้ายตำแหน่ง
      if (e.target.classList.contains('resize-handle')) return;
      isDragging = true;
      startX = e.clientX - div.offsetLeft;
      startY = e.clientY - div.offsetTop;
      div.style.zIndex = 1000;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      let newX = e.clientX - startX;
      let newY = e.clientY - startY;
      div.style.left = newX + 'px';
      div.style.top = newY + 'px';
      itemData.x = newX;
      itemData.y = newY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      div.style.zIndex = 10;
    });

    // เพิ่มปุ่มย่อ/ขยายขนาด (Scale Handle) ให้รูปภาพและสติ๊กเกอร์
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.innerHTML = '↔';
    resizeHandle.title = 'ลากเพื่อย่อ/ขยาย';
    div.appendChild(resizeHandle);

    let isResizing = false;
    let initialDist = 0;
    let initialScale = itemData.scale || 1;

    resizeHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isResizing = true;
      initialScale = itemData.scale || 1;
      
      const rect = div.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const onMouseMove = (moveEvent) => {
        if (!isResizing) return;
        const currentDist = Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY);
        if (!initialDist) initialDist = currentDist;
        
        let newScale = initialScale * (currentDist / initialDist);
        if (newScale < 0.3) newScale = 0.3; // จำกัดขนาดเล็กสุด
        if (newScale > 3) newScale = 3;     // จำกัดขนาดใหญ่สุด
        
        itemData.scale = newScale;
        div.style.transform = `rotate(${itemData.rotate || 0}deg) scale(${newScale})`;
      };

      const onMouseUp = () => {
        isResizing = false;
        initialDist = 0;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    // ดับเบิ้ลคลิกเพื่อลบไอเทมออก
    div.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      div.remove();
      if (itemData.type === 'sticker') {
        stickersList = stickersList.filter(s => s !== itemData);
      } else {
        uploadedPhotos = uploadedPhotos.filter(p => p !== itemData);
      }
    });
  }

  container.appendChild(div);
}

// --- 5. การทำงานหลักเมื่อหน้าเว็บโหลดเสร็จ ---
document.addEventListener('DOMContentLoaded', () => {
  checkRecipientMode();

  let selectedCoverStyle = 'envelope';
  const styleBtns = document.querySelectorAll('.style-btn');
  styleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      styleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCoverStyle = btn.getAttribute('data-style');
      const coverColor = document.getElementById('coverColorPicker').value;
      updateCoverDisplay(selectedCoverStyle, customCoverImg, 'coverGraphic', 'coverBadge', coverColor);
    });
  });

  const customCoverInput = document.getElementById('customCoverInput');
  if (customCoverInput) {
    customCoverInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          customCoverImg = evt.target.result;
          const coverColor = document.getElementById('coverColorPicker').value;
          updateCoverDisplay(selectedCoverStyle, customCoverImg, 'coverGraphic', 'coverBadge', coverColor);
          document.getElementById('customCoverLabel').innerText = '🖼️ เปลี่ยนรูปหน้าปกแล้ว ✓';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const themeColorPicker = document.getElementById('themeColorPicker');
  if (themeColorPicker) {
    themeColorPicker.addEventListener('input', (e) => {
      document.body.style.backgroundColor = e.target.value;
    });
  }

  const coverColorPicker = document.getElementById('coverColorPicker');
  if (coverColorPicker) {
    coverColorPicker.addEventListener('input', (e) => {
      if (!customCoverImg) {
        updateCoverDisplay(selectedCoverStyle, null, 'coverGraphic', 'coverBadge', e.target.value);
      }
    });
  }

  // Real-time Preview ข้อความต่างๆ
  const setupRealtimeText = (inputId, previewId, fontId, sizeId, boldId, colorId) => {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const font = document.getElementById(fontId);
    const size = document.getElementById(sizeId);
    const bold = document.getElementById(boldId);
    const color = document.getElementById(colorId);

    function update() {
      if (!preview) return;
      preview.innerText = input?.value || '';
      preview.style.fontFamily = font?.value || "'Mali', cursive";
      preview.style.fontSize = (size?.value || 16) + 'px';
      preview.style.fontWeight = bold?.classList.contains('active') ? 'bold' : 'normal';
      preview.style.color = color?.value || '#000000';
    }

    [input, font, size, color].forEach(el => el?.addEventListener('input', update));
    bold?.addEventListener('click', () => {
      bold.classList.toggle('active');
      update();
    });
  };

  setupRealtimeText('coverTitleInput', 'coverTitleText', 'coverTitleFont', 'coverTitleSize', 'coverTitleBold', 'coverTitleColor');
  setupRealtimeText('coverSubtextInput', 'coverSubtext', 'coverSubtextFont', 'coverSubtextSize', 'coverSubtextBold', 'coverSubtextColor');
  setupRealtimeText('greetingInput', 'previewGreeting', 'greetingFont', 'greetingSize', 'greetingBold', 'greetingColor');
  setupRealtimeText('messageInput', 'previewMessage', 'messageFont', 'messageSize', 'messageBold', 'messageColor');
  setupRealtimeText('signatureInput', 'previewSignature', 'signatureFont', 'signatureSize', 'signatureBold', 'signatureColor');

  // อัปโหลดรูปภาพหลายรูป
  const multiPhotoInput = document.getElementById('multiPhotoInput');
  const photosCanvas = document.getElementById('photosCanvas');
  if (multiPhotoInput && photosCanvas) {
    multiPhotoInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const photoData = {
            type: 'photo',
            content: evt.target.result,
            x: 40 + Math.random() * 40,
            y: 40 + Math.random() * 40,
            rotate: (Math.random() - 0.5) * 15,
            scale: 1
          };
          uploadedPhotos.push(photoData);
          renderInteractiveItem(photosCanvas, photoData, true);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  // กดเพิ่มสติ๊กเกอร์
  const stickerCanvas = document.getElementById('stickerCanvas');
  const stickerBtns = document.querySelectorAll('.sticker-add-btn');
  stickerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      const stickerData = {
        type: 'sticker',
        content: emoji,
        x: 60 + Math.random() * 100,
        y: 60 + Math.random() * 100,
        rotate: (Math.random() - 0.5) * 20,
        scale: 1
      };
      stickersList.push(stickerData);
      renderInteractiveItem(stickerCanvas, stickerData, true);
    });
  });

  // เปิด-ปิดซองจดหมายในหน้าพรีวิว
  const coverEnvelope = document.getElementById('coverEnvelope');
  const previewContainer = document.getElementById('previewContainer');
  const letterBoard = document.getElementById('letterBoard');

  if (coverEnvelope && previewContainer) {
    coverEnvelope.addEventListener('click', (e) => {
      e.stopPropagation();
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

  // --- 6. บันทึกข้อมูลและสร้างลิงก์ (แก้ปัญหาไม่มีลิงก์แสดง) ---
  const saveButton = document.getElementById('saveButton');
  const copyLinkButton = document.getElementById('copyLinkButton');
  const statusBox = document.getElementById('statusBox');

  let generatedShareLink = '';

  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      saveButton.innerText = 'กำลังสร้างจดหมาย... 💖';
      saveButton.disabled = true;

      const payload = {
        themeColor: themeColorPicker ? themeColorPicker.value : '#ffb6c1',
        coverColor: coverColorPicker ? coverColorPicker.value : '#ff5277',
        coverStyle: selectedCoverStyle,
        customCoverImage: customCoverImg,
        textStyles: {
          coverTitle: {
            text: document.getElementById('coverTitleInput')?.value || '',
            font: document.getElementById('coverTitleFont')?.value || '',
            size: document.getElementById('coverTitleSize')?.value || 16,
            bold: document.getElementById('coverTitleBold')?.classList.contains('active') || false,
            color: document.getElementById('coverTitleColor')?.value || '#000'
          },
          coverSubtext: {
            text: document.getElementById('coverSubtextInput')?.value || '',
            font: document.getElementById('coverSubtextFont')?.value || '',
            size: document.getElementById('coverSubtextSize')?.value || 14,
            bold: document.getElementById('coverSubtextBold')?.classList.contains('active') || false,
            color: document.getElementById('coverSubtextColor')?.value || '#000'
          },
          greeting: {
            text: document.getElementById('greetingInput')?.value || '',
            font: document.getElementById('greetingFont')?.value || '',
            size: document.getElementById('greetingSize')?.value || 18,
            bold: document.getElementById('greetingBold')?.classList.contains('active') || false,
            color: document.getElementById('greetingColor')?.value || '#000'
          },
          message: {
            text: document.getElementById('messageInput')?.value || '',
            font: document.getElementById('messageFont')?.value || '',
            size: document.getElementById('messageSize')?.value || 16,
            bold: document.getElementById('messageBold')?.classList.contains('active') || false,
            color: document.getElementById('messageColor')?.value || '#000'
          },
          signature: {
            text: document.getElementById('signatureInput')?.value || '',
            font: document.getElementById('signatureFont')?.value || '',
            size: document.getElementById('signatureSize')?.value || 16,
            bold: document.getElementById('signatureBold')?.classList.contains('active') || false,
            color: document.getElementById('signatureColor')?.value || '#000'
          }
        },
        photos: uploadedPhotos,
        stickers: stickersList
      };

      try {
        const response = await fetch('/api/letters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
          generatedShareLink = window.location.origin + '/letter/' + result.slug;
          
          // แสดงผลกล่องลิงก์และปุ่มคัดลอกให้ชัดเจน
          if (statusBox) {
            statusBox.innerHTML = `
              <div style="background: #fff; padding: 15px; border-radius: 8px; border: 2px dashed #ff5277; margin-top: 15px;">
                <p style="color: #27ae60; font-weight: bold; margin-bottom: 8px;">✨ สร้างจดหมายสำเร็จแล้ว!</p>
                <input type="text" readonly value="${generatedShareLink}" id="shareLinkInput" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; text-align: center; margin-bottom: 8px; background: #f9f9f9;" onclick="this.select()">
                <p style="font-size: 12px; color: #666;">คัดลอกลิงก์ด้านบนไปส่งให้แฟนได้เลย</p>
              </div>
            `;
          }
          saveButton.style.display = 'none';
          if (copyLinkButton) copyLinkButton.style.display = 'block';
        } else {
          alert('เกิดข้อผิดพลาดในการบันทึก: ' + (result.error || 'Unknown error'));
          saveButton.innerText = '💖 สร้างจดหมาย & รับลิงก์ส่งแฟน';
          saveButton.disabled = false;
        }
      } catch (err) {
        console.error(err);
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        saveButton.innerText = '💖 สร้างจดหมาย & รับลิงก์ส่งแฟน';
        saveButton.disabled = false;
      }
    });
  }

  if (copyLinkButton) {
    copyLinkButton.addEventListener('click', () => {
      navigator.clipboard.writeText(generatedShareLink).then(() => {
        copyLinkButton.innerText = '📋 คัดลอกลิงก์แล้ว! ✨';
        setTimeout(() => { copyLinkButton.innerText = '📋 คัดลอกลิงก์'; }, 3000);
      });
    });
  }
});

// --- 7. ฟังก์ชันโหลดหน้าผู้รับ ---
async function checkRecipientMode() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);

  if (match) {
    const slug = match[1];
    const mainApp = document.getElementById('mainApp');
    const recipientView = document.getElementById('recipientView');
    
    const recipientStage = recipientView ? recipientView.querySelector('#recipientStage') : document.getElementById('recipientStage');
    const recipientCover = recipientView ? recipientView.querySelector('#recipientCover') : document.getElementById('recipientCover');
    const recipientLetterBoard = recipientView ? recipientView.querySelector('#recipientLetterBoard') : document.getElementById('recipientLetterBoard');

    if (mainApp) mainApp.style.display = 'none';

    try {
      const res = await fetch(`/api/letters/${slug}`);
      if (res.ok) {
        const data = await res.json();
        
        if (data.themeColor) document.body.style.backgroundColor = data.themeColor;

        if (data.textStyles) {
          const styles = data.textStyles;
          if (styles.coverTitle) applyStyleToElem(recipientView.querySelector('#recipientCoverTitle'), styles.coverTitle);
          if (styles.coverSubtext) applyStyleToElem(recipientView.querySelector('#recipientCoverSubtext'), styles.coverSubtext);
          if (styles.greeting) applyStyleToElem(recipientView.querySelector('#recipientGreeting'), styles.greeting);
          if (styles.message) applyStyleToElem(recipientView.querySelector('#recipientMessage'), styles.message);
          if (styles.signature) applyStyleToElem(recipientView.querySelector('#recipientSignature'), styles.signature);
        }

        const coverStyle = data.coverStyle || 'envelope';
        const customImg = data.customCoverImage || '';
        const coverColor = data.coverColor || '#ff5277';

        updateCoverDisplay(coverStyle, customImg, 'recipientCoverGraphic', 'recipientCoverBadge', coverColor);

        const rPhotosCanvas = recipientView.querySelector('#recipientPhotosCanvas');
        if (data.photos && Array.isArray(data.photos)) {
          data.photos.forEach(p => renderInteractiveItem(rPhotosCanvas, p, false));
        }

        const rStickerCanvas = recipientView.querySelector('#recipientStickerCanvas');
        if (data.stickers && Array.isArray(data.stickers)) {
          data.stickers.forEach(s => renderInteractiveItem(rStickerCanvas, s, false));
        }

        if (recipientCover && recipientStage) {
          recipientCover.addEventListener('click', (e) => {
            e.stopPropagation();
            recipientStage.classList.add('open');
            recipientStage.classList.remove('closed');
          });
        }

        if (recipientLetterBoard && recipientStage) {
          recipientLetterBoard.addEventListener('click', (e) => {
            if (
              e.target === recipientLetterBoard || 
              e.target.id === 'recipientPhotosCanvas' || 
              e.target.id === 'recipientStickerCanvas'
            ) {
              recipientStage.classList.remove('open');
              recipientStage.classList.add('closed');
            }
          });
        }

        if (recipientView) {
          recipientView.style.display = 'block';
          setTimeout(() => { recipientView.style.opacity = '1'; }, 50);
        }
      } else {
        alert('ไม่พบข้อมูลจดหมาย หรือลิงก์อาจจะไม่ถูกต้อง');
      }
    } catch (e) {
      console.error('Error:', e);
    }
  }
}