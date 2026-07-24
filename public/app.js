// 1. ปรับการแสดงผล Item ให้รองรับทั้ง % (เวลาแสดงผลจริง) และ px (ตอนกำลังลากจัดตำแหน่ง)
function renderInteractiveItem(canvas, itemData, isEditable = false) {
  if (!canvas) return;

  const item = document.createElement('div');
  item.className = `interactive-item ${itemData.type === 'photo' ? 'frame-' + (itemData.frameStyle || 'polaroid') : 'item-sticker'}`;
  item.id = itemData.id;
  
  item.style.position = 'absolute';
  
  // ตรวจสอบว่าเป็น % หรือ px
  item.style.left = typeof itemData.x === 'string' && itemData.x.includes('%') ? itemData.x : itemData.x + 'px';
  item.style.top = typeof itemData.y === 'string' && itemData.y.includes('%') ? itemData.y : itemData.y + 'px';
  item.style.width = typeof itemData.width === 'string' && itemData.width.includes('%') ? itemData.width : itemData.width + 'px';
  
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
    // ปรับขนาดฟอนต์ตามขนาดการ์ด
    const numericWidth = parseFloat(itemData.width);
    item.style.fontSize = (itemData.width + '').includes('%') ? `${numericWidth * 2.5}vw` : (numericWidth * 0.8) + 'px';
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

// 2. ปรับฟังก์ชันการลาก/ขยาย ให้แปลงค่าเป็น % ของ Canvas ก่อนบันทึก
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

      // แปลงค่าพิกเซลเป็นเปอร์เซ็นต์เทียบกับขนาด Canvas
      itemData.x = ((leftPx / canvasRect.width) * 100).toFixed(2) + '%';
      itemData.y = ((topPx / canvasRect.height) * 100).toFixed(2) + '%';
      itemData.width = ((widthPx / canvasRect.width) * 100).toFixed(2) + '%';
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
      updatePercentages(); // อัปเดตพิกัด % ทุกครั้งที่ปล่อยมือ/เมาส์
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