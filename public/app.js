// --- 1. ตัวแปรสถานะและค่าเริ่มต้น ---
let uploadedPhotos = []; // เก็บรูปภาพที่อัปโหลดในฟอร์มสร้าง
let stickersList = [];   // เก็บรายการสติ๊กเกอร์
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

  // ล้างคลาสเก่า
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

// --- 4. ระบบ Interactive สร้างไอเทมลากวาง (รูปภาพและสติ๊กเกอร์) ---
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
    
    // จัดการกรอบรูป
    const frameStyle = document.getElementById('photoFrameStyleSelect')?.value || 'polaroid';
    div.classList.add('frame-' + frameStyle);
    div.appendChild(img);
  }

  // ถ้าอยู่ในโหมดแก้ไข (หน้าคนสร้าง) ให้ลากขยับตำแหน่งและลบได้
  if (isEditable) {
    let isDragging = false;
    let startX, startY;

    div.addEventListener('mousedown', (e) => {
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

    // ดับเบิ้ลคลิกเพื่อลบไอเทมออก
    div.addEventListener('dblclick', () => {
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
  // ตรวจสอบว่าเป็นลิงก์เปิดจดหมายของเพื่อนหรือไม่
  checkRecipientMode();

  // จัดการปุ่มเลือกสไตล์ปก
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

  // อัปโหลดรูปหน้าปกเอง
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

  // เปลี่ยนสีธีมและสีปก
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

  // Real-time Preview ข้อความหัวข้อปก
  const coverTitleInput = document.getElementById('coverTitleInput');
  const coverTitleText = document.getElementById('coverTitleText');
  const coverTitleFont = document.getElementById('coverTitleFont');
  const coverTitleSize = document.getElementById('coverTitleSize');
  const coverTitleBold = document.getElementById('coverTitleBold');
  const coverTitleColor = document.getElementById('coverTitleColor');

  function updateCoverTitleStyle() {
    if (!coverTitleText) return;
    coverTitleText.innerText = coverTitleInput.value;
    coverTitleText.style.fontFamily = coverTitleFont.value;
    coverTitleText.style.fontSize = coverTitleSize.value + 'px';
    coverTitleText.style.fontWeight = coverTitleBold.classList.contains('active') ? 'bold' : 'normal';
    coverTitleText.style.color = coverTitleColor.value;
  }

  [coverTitleInput, coverTitleFont, coverTitleSize, coverTitleColor].forEach(elem => {
    elem?.addEventListener('input', updateCoverTitleStyle);
  });
  coverTitleBold?.addEventListener('click', () => {
    coverTitleBold.classList.toggle('active');
    updateCoverTitleStyle();
  });

  // Real-time Preview ข้อความโปรยใต้ปก
  const coverSubtextInput = document.getElementById('coverSubtextInput');
  const coverSubtext = document.getElementById('coverSubtext');
  const coverSubtextFont = document.getElementById('coverSubtextFont');
  const coverSubtextSize = document.getElementById('coverSubtextSize');
  const coverSubtextBold = document.getElementById('coverSubtextBold');
  const coverSubtextColor = document.getElementById('coverSubtextColor');

  function updateCoverSubstyle() {
    if (!coverSubtext) return;
    coverSubtext.innerText = coverSubtextInput.value;
    coverSubtext.style.fontFamily = coverSubtextFont.value;
    coverSubtext.style.fontSize = coverSubtextSize.value + 'px';
    coverSubtext.style.fontWeight = coverSubtextBold.classList.contains('active') ? 'bold' : 'normal';
    coverSubtext.style.color = coverSubtextColor.value;
  }

  [coverSubtextInput, coverSubtextFont, coverSubtextSize, coverSubtextColor].forEach(elem => {
    elem?.addEventListener('input', updateCoverSubstyle);
  });
  coverSubtextBold?.addEventListener('click', () => {
    coverSubtextBold.classList.toggle('active');
    updateCoverSubstyle();
  });

  // Real-time Preview คำขึ้นต้น
  const greetingInput = document.getElementById('greetingInput');
  const previewGreeting = document.getElementById('previewGreeting');
  const greetingFont = document.getElementById('greetingFont');
  const greetingSize = document.getElementById('greetingSize');
  const greetingBold = document.getElementById('greetingBold');
  const greetingColor = document.getElementById('greetingColor');

  function updateGreetingStyle() {
    if (!previewGreeting) return;
    previewGreeting.innerText = greetingInput.value;
    previewGreeting.style.fontFamily = greetingFont.value;
    previewGreeting.style.fontSize = greetingSize.value + 'px';
    previewGreeting.style.fontWeight = greetingBold.classList.contains('active') ? 'bold' : 'normal';
    previewGreeting.style.color = greetingColor.value;
  }

  [greetingInput, greetingFont, greetingSize, greetingColor].forEach(elem => {
    elem?.addEventListener('input', updateGreetingStyle);
  });
  greetingBold?.addEventListener('click', () => {
    greetingBold.classList.toggle('active');
    updateGreetingStyle();
  });

  // Real-time Preview ข้อความบอกรัก
  const messageInput = document.getElementById('messageInput');
  const previewMessage = document.getElementById('previewMessage');
  const messageFont = document.getElementById('messageFont');
  const messageSize = document.getElementById('messageSize');
  const messageBold = document.getElementById('messageBold');
  const messageColor = document.getElementById('messageColor');

  function updateMessageStyle() {
    if (!previewMessage) return;
    previewMessage.innerText = messageInput.value;
    previewMessage.style.fontFamily = messageFont.value;
    previewMessage.style.fontSize = messageSize.value + 'px';
    previewMessage.style.fontWeight = messageBold.classList.contains('active') ? 'bold' : 'normal';
    previewMessage.style.color = messageColor.value;
  }

  [messageInput, messageFont, messageSize, messageColor].forEach(elem => {
    elem?.addEventListener('input', updateMessageStyle);
  });
  messageBold?.addEventListener('click', () => {
    messageBold.classList.toggle('active');
    updateMessageStyle();
  });

  // Real-time Preview คำลงท้าย
  const signatureInput = document.getElementById('signatureInput');
  const previewSignature = document.getElementById('previewSignature');
  const signatureFont = document.getElementById('signatureFont');
  const signatureSize = document.getElementById('signatureSize');
  const signatureBold = document.getElementById('signatureBold');
  const signatureColor = document.getElementById('signatureColor');

  function updateSignatureStyle() {
    if (!previewSignature) return;
    previewSignature.innerText = signatureInput.value;
    previewSignature.style.fontFamily = signatureFont.value;
    previewSignature.style.fontSize = signatureSize.value + 'px';
    previewSignature.style.fontWeight = signatureBold.classList.contains('active') ? 'bold' : 'normal';
    previewSignature.style.color = signatureColor.value;
  }

  [signatureInput, signatureFont, signatureSize, signatureColor].forEach(elem => {
    elem?.addEventListener('input', updateSignatureStyle);
  });
  signatureBold?.addEventListener('click', () => {
    signatureBold.classList.toggle('active');
    updateSignatureStyle();
  });

  // อัปโหลดรูปภาพหลายรูปใส่กระดานพรีวิว
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
            x: 30 + Math.random() * 50,
            y: 30 + Math.random() * 50,
            rotate: (Math.random() - 0.5) * 20,
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
        x: 50 + Math.random() * 150,
        y: 50 + Math.random() * 150,
        rotate: (Math.random() - 0.5) * 30,
        scale: 1
      };
      stickersList.push(stickerData);
      renderInteractiveItem(stickerCanvas, stickerData, true);
    });
  });

  // เปิด-ปิดซองจดหมายในหน้าจอตัวอย่าง (Preview Stage)
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

  // --- 6. บันทึกข้อมูลและสร้างลิงก์ ---
  const saveButton = document.getElementById('saveButton');
  const copyLinkButton = document.getElementById('copyLinkButton');
  const statusBox = document.getElementById('statusBox');

  let generatedShareLink = '';

  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      saveButton.innerText = 'กำลังสร้างจดหมาย... 💖';
      saveButton.disabled = true;

      const payload = {
        themeColor: themeColorPicker.value,
        coverColor: coverColorPicker.value,
        coverStyle: selectedCoverStyle,
        customCoverImage: customCoverImg,
        textStyles: {
          coverTitle: {
            text: coverTitleInput.value,
            font: coverTitleFont.value,
            size: coverTitleSize.value,
            bold: coverTitleBold.classList.contains('active'),
            color: coverTitleColor.value
          },
          coverSubtext: {
            text: coverSubtextInput.value,
            font: coverSubtextFont.value,
            size: coverSubtextSize.value,
            bold: coverSubtextBold.classList.contains('active'),
            color: coverSubtextColor.value
          },
          greeting: {
            text: greetingInput.value,
            font: greetingFont.value,
            size: greetingSize.value,
            bold: greetingBold.classList.contains('active'),
            color: greetingColor.value
          },
          message: {
            text: messageInput.value,
            font: messageFont.value,
            size: messageSize.value,
            bold: messageBold.classList.contains('active'),
            color: messageColor.value
          },
          signature: {
            text: signatureInput.value,
            font: signatureFont.value,
            size: signatureSize.value,
            bold: signatureBold.classList.contains('active'),
            color: signatureColor.value
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
          statusBox.innerHTML = `<p style="color: green; margin-top: 10px;">สร้างจดหมายสำเร็จ! คัดลอกลิงก์ด้านล่างไปส่งให้แฟนได้เลย ✨</p>`;
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

// --- 7. ฟังก์ชันสำหรับโหลดและแสดงผลหน้าผู้รับลิงก์ ---
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