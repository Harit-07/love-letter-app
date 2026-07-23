// เก็บสถานะรูปโพลารอยด์
let photoList = [];

// พิกัดมุมทั้ง 4 ของกระดานสำหรับวางรูปโพลารอยด์
const polaroidPositions = [
  { top: '6%', left: '6%', rotate: '-8deg' },   // มุมบนซ้าย
  { top: '6%', right: '6%', rotate: '8deg' },   // มุมบนขวา
  { bottom: '6%', left: '6%', rotate: '6deg' },  // มุมล่างซ้าย
  { bottom: '6%', right: '6%', rotate: '-7deg' } // มุมล่างขวา
];

document.addEventListener('DOMContentLoaded', () => {
  setupLiveBinding();
  setupEnvelopeToggle();
  setupPhotoUploader();
  setupCoverUploader();
});

// ================= 1. ระบบผูกข้อความเรียลไทม์ (Live Binding) =================
function setupLiveBinding() {
  // หน้าปก
  bindInput('coverTitleInput', 'coverTitleDisplay', 'innerText');
  bindInput('coverSubInput', 'coverSubDisplay', 'innerText');
  bindStyle('coverTitleFont', 'coverTitleDisplay', 'fontFamily');
  bindStyle('coverTitleSize', 'coverTitleDisplay', 'fontSize', 'px');
  bindStyle('coverTitleColor', 'coverTitleDisplay', 'color');
  bindStyle('coverSubFont', 'coverSubDisplay', 'fontFamily');
  bindStyle('coverSubSize', 'coverSubDisplay', 'fontSize', 'px');
  bindStyle('coverSubColor', 'coverSubDisplay', 'color');

  // ในจดหมาย
  bindInput('greetingInput', 'greetingDisplay', 'innerText');
  bindInput('messageInput', 'messageDisplay', 'innerText');
  bindInput('signatureInput', 'signatureDisplay', 'innerText');

  bindStyle('greetingFont', 'greetingDisplay', 'fontFamily');
  bindStyle('greetingSize', 'greetingDisplay', 'fontSize', 'px');
  bindStyle('greetingColor', 'greetingDisplay', 'color');

  bindStyle('messageFont', 'messageDisplay', 'fontFamily');
  bindStyle('messageSize', 'messageDisplay', 'fontSize', 'px');
  bindStyle('messageColor', 'messageDisplay', 'color');

  bindStyle('signatureFont', 'signatureDisplay', 'fontFamily');
  bindStyle('signatureSize', 'signatureDisplay', 'fontSize', 'px');
  bindStyle('signatureColor', 'signatureDisplay', 'color');
}

function bindInput(inputId, displayId, prop) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  if (input && display) {
    input.addEventListener('input', () => {
      display[prop] = input.value;
    });
  }
}

function bindStyle(inputId, displayId, styleProp, unit = '') {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  if (input && display) {
    input.addEventListener('input', () => {
      display.style[styleProp] = input.value + unit;
    });
  }
}

// ================= 2. ระบบเปิด-ปิดซองจดหมาย =================
function setupEnvelopeToggle() {
  const previewContainer = document.getElementById('previewContainer');
  const coverEnvelope = document.getElementById('coverEnvelope');
  const letterBoard = document.getElementById('letterBoard');
  const btnCloseLetter = document.getElementById('btnCloseLetter');
  const mainCard = document.querySelector('.main-card');

  // คลิกที่ปกเพื่อ "เปิด"
  if (coverEnvelope && previewContainer) {
    coverEnvelope.addEventListener('click', (e) => {
      e.stopPropagation();
      previewContainer.classList.add('open');
      previewContainer.classList.remove('closed');
    });
  }

  // คลิกปุ่มปิดจดหมาย
  if (btnCloseLetter && previewContainer) {
    btnCloseLetter.addEventListener('click', (e) => {
      e.stopPropagation();
      previewContainer.classList.remove('open');
      previewContainer.classList.add('closed');
    });
  }

  // คลิกที่พื้นหลังกระดานจดหมายเพื่อ "ปิด" (เว้นการคลิกโดนการ์ดหรือสติ๊กเกอร์)
  if (letterBoard && previewContainer) {
    letterBoard.addEventListener('click', (e) => {
      if (!e.target.closest('.interactive-item') && !e.target.closest('.main-card')) {
        previewContainer.classList.remove('open');
        previewContainer.classList.add('closed');
      }
    });
  }

  // ป้องกันการคลิกโดนการ์ดแล้วจดหมายปิด
  if (mainCard) {
    mainCard.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

// ================= 3. เลือกรูปแบบปก / อัปโหลดรูปปก =================
function setCoverStyle(type) {
  const iconDisplay = document.getElementById('coverIconDisplay');
  const customImg = document.getElementById('customCoverImg');
  
  if (customImg) customImg.classList.add('hidden');
  if (iconDisplay) iconDisplay.classList.remove('hidden');

  if (type === 'envelope') iconDisplay.innerText = '💌';
  else if (type === 'gift') iconDisplay.innerText = '🎁';
  else if (type === 'bear') iconDisplay.innerText = '🧸';

  // อัปเดตสถานะปุ่ม Active
  document.querySelectorAll('.btn-option').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

function setupCoverUploader() {
  const input = document.getElementById('coverImageInput');
  const iconDisplay = document.getElementById('coverIconDisplay');
  const customImg = document.getElementById('customCoverImg');

  if (input) {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        customImg.src = url;
        customImg.classList.remove('hidden');
        if (iconDisplay) iconDisplay.classList.add('hidden');
      }
    });
  }
}

// ================= 4. ระบบเพิ่มสติ๊กเกอร์กระจายตัว =================
function addSticker(stickerIcon) {
  const letterBoard = document.getElementById('letterBoard');
  if (!letterBoard) return;

  const stickerEl = document.createElement('div');
  stickerEl.className = 'interactive-item sticker-item';
  stickerEl.innerText = stickerIcon;

  // สุ่มพิกัดกระจายบนกระดาน (ไม่ให้กองซ้ายสุด)
  const randomLeft = Math.floor(Math.random() * 75) + 10; // 10% ถึง 85%
  const randomTop = Math.floor(Math.random() * 75) + 10;  // 10% ถึง 85%
  const randomRotate = Math.floor(Math.random() * 40) - 20; // -20deg ถึง 20deg

  stickerEl.style.position = 'absolute';
  stickerEl.style.left = `${randomLeft}%`;
  stickerEl.style.top = `${randomTop}%`;
  stickerEl.style.transform = `rotate(${randomRotate}deg)`;

  // ป้องกัน click propagation
  stickerEl.addEventListener('click', (e) => e.stopPropagation());

  letterBoard.appendChild(stickerEl);
}

// ================= 5. ระบบอัปโหลดรูปภาพโพลารอยด์ประจำมุม =================
function setupPhotoUploader() {
  const photoInput = document.getElementById('photoInput');
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      photoList = files.map(file => URL.createObjectURL(file));
      renderPhotos();
    });
  }
}

function renderPhotos() {
  const letterBoard = document.getElementById('letterBoard');
  if (!letterBoard) return;

  // ลบโพลารอยด์เก่าออกก่อน
  document.querySelectorAll('.polaroid-photo-item').forEach(el => el.remove());

  photoList.forEach((url, index) => {
    const pos = polaroidPositions[index % polaroidPositions.length];
    
    const photoCard = document.createElement('div');
    photoCard.className = 'interactive-item polaroid-photo-item';
    photoCard.innerHTML = `<img src="${url}" alt="Memory Photo" />`;

    photoCard.style.position = 'absolute';
    photoCard.style.top = pos.top || 'auto';
    photoCard.style.bottom = pos.bottom || 'auto';
    photoCard.style.left = pos.left || 'auto';
    photoCard.style.right = pos.right || 'auto';
    photoCard.style.transform = `rotate(${pos.rotate})`;

    photoCard.addEventListener('click', (e) => e.stopPropagation());

    letterBoard.appendChild(photoCard);
  });
}

// ================= 6. ปุ่มสร้างลิงก์ =================
function generateShareLink() {
  alert('✨ สร้างจดหมายเรียบร้อยแล้ว! พร้อมส่งลิงก์เซอร์ไพรส์แฟนได้เลย 💕');
}